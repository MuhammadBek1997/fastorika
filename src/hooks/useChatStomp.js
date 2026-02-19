/**
 * React Hook - Chat STOMP client for Spring Boot backend
 *
 * Foydalanish (CLIENT uchun):
 *
 * const {
 *   messages,
 *   sendMessage,
 *   isConnected,
 *   isLoading,
 *   error,
 *   markAsRead
 * } = useChatStomp();
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';

// Chat API now on main backend (api.fastorika.com)
// Keep trailing slash for proper URL concatenation
const API_BASE = (import.meta.env.VITE_API_URL || 'https://api.fastorika.com/api/').replace(/\/?$/, '/');

export const useChatStomp = () => {
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatRoomId, setChatRoomId] = useState(null);
  const chatRoomIdRef = useRef(null); // Ref to avoid stale closure
  const userIdRef = useRef(null);
  const [userId, setUserId] = useState(null);

  // Get JWT token
  const getToken = useCallback(() => {
    return sessionStorage.getItem('token') || localStorage.getItem('token') || '';
  }, []);

  // API call helper
  const apiCall = useCallback(async (endpoint, method = 'GET', body = null) => {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const url = `${API_BASE}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }, [getToken]);

  // Get WebSocket URL from API base (remove /api/ path for WebSocket)
  const getWsUrl = useCallback(() => {
    const baseUrl = API_BASE.replace(/\/api\/?$/, '') || window.location.origin;
    return baseUrl.replace(/^http/, 'ws') + '/ws-chat';
  }, []);

  // Load user info and chat history
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get user info
      const userResponse = await apiCall('users/me');
      const userData = userResponse?.data || userResponse;
      setUserId(userData.id);
      userIdRef.current = userData.id;

      // Load chat history (chatroom yo'q bo'lsa xato emas — bo'sh qoladi)
      try {
        const chatResponse = await apiCall('chat/my?page=0&size=100');
        const chatData = chatResponse?.data;

        if (chatData && chatData.content && chatData.content.length > 0) {
          // Extract chatRoomId from first message
          const roomId = chatData.content[0].chatRoomId;
          setChatRoomId(roomId);
          chatRoomIdRef.current = roomId;

          // Transform messages
          const transformedMessages = chatData.content.map(msg => ({
            id: msg.id,
            chatRoomId: msg.chatRoomId,
            senderId: msg.senderId,
            senderFullName: msg.senderFullName,
            senderType: msg.senderId === userData.id ? 'user' : 'admin',
            content: msg.messageText,
            messageText: msg.messageText,
            imageUrl: msg.imageUrl || null,
            imageData: msg.imageData || null,
            contentType: msg.contentType || 'TEXT',
            createdAt: msg.createdAt,
            isRead: msg.isRead
          }));

          setMessages(transformedMessages);
        }
      } catch (chatErr) {
        // Chatroom hali yo'q — birinchi xabar yuborilganda yaratiladi
        console.log('No chat room yet, will be created on first message');
      }

      return userData;
    } catch (err) {
      console.error('Load initial data error:', err);
      if (err.message !== 'No authentication token') {
        setError(err.message);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiCall]);

  // Reload messages from REST API (used when IMAGE message arrives via STOMP without imageData)
  const reloadMessages = useCallback(async () => {
    try {
      const chatResponse = await apiCall('chat/my?page=0&size=100');
      const chatData = chatResponse?.data;
      if (chatData && chatData.content) {
        const uid = userIdRef.current;
        const transformedMessages = chatData.content.map(msg => ({
          id: msg.id,
          chatRoomId: msg.chatRoomId,
          senderId: msg.senderId,
          senderFullName: msg.senderFullName,
          senderType: msg.senderId === uid ? 'user' : 'admin',
          content: msg.messageText,
          messageText: msg.messageText,
          imageData: msg.imageData || null,
          contentType: msg.contentType || 'TEXT',
          createdAt: msg.createdAt,
          isRead: msg.isRead
        }));
        setMessages(transformedMessages);
      }
    } catch (err) {
      console.error('Reload messages error:', err);
    }
  }, [apiCall]);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError('No authentication token');
      setIsLoading(false);
      return;
    }

    // Load initial data first
    const userData = await loadInitialData();
    if (!userData) return;

    const wsUrl = getWsUrl();

    // Create STOMP client
    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        'Authorization': `Bearer ${token}`
      },
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('[STOMP]', str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    client.onConnect = () => {
      console.log('STOMP connected');
      setIsConnected(true);
      setError(null);
      stompClientRef.current = client;

      // Subscribe to user's chat topic
      const topic = `/topic/chat.${userData.id}`;
      subscriptionRef.current = client.subscribe(topic, (frame) => {
        try {
          const message = JSON.parse(frame.body);

          // Transform incoming message
          const transformedMessage = {
            id: message.id,
            chatRoomId: message.chatRoomId,
            senderId: message.senderId,
            senderFullName: message.senderFullName,
            senderType: message.senderId === userData.id ? 'user' : 'admin',
            content: message.messageText,
            messageText: message.messageText,
            imageUrl: message.imageUrl || null,
            imageData: message.imageData || null,
            contentType: message.contentType || 'TEXT',
            createdAt: message.createdAt,
            isRead: message.isRead
          };

          // Update chatRoomId if not set (use ref to avoid stale closure)
          if (message.chatRoomId && !chatRoomIdRef.current) {
            setChatRoomId(message.chatRoomId);
            chatRoomIdRef.current = message.chatRoomId;
          }

          // For IMAGE messages: if self-sent, skip (already added by sendImage)
          if (message.contentType === 'IMAGE' && message.senderId === userData.id) {
            // Update local message with real ID if needed
            setMessages(prev => {
              const exists = prev.some(m => m.id === message.id);
              if (exists) return prev;
              return prev;
            });
          } else {
            // Add message to list (avoid duplicates)
            setMessages(prev => {
              const exists = prev.some(m => m.id === transformedMessage.id);
              if (exists) return prev;
              return [...prev, transformedMessage];
            });
          }
        } catch (err) {
          console.error('Message parse error:', err);
        }
      });

      console.log('Subscribed to topic:', topic);
    };

    client.onStompError = (frame) => {
      console.error('STOMP error:', frame.headers['message'], frame.body);
      setError(frame.headers['message'] || 'STOMP connection error');
      setIsConnected(false);
    };

    client.onWebSocketClose = () => {
      console.log('WebSocket closed');
      setIsConnected(false);
    };

    client.onWebSocketError = (event) => {
      console.error('WebSocket error:', event);
      setError('WebSocket connection error');
      setIsConnected(false);
    };

    client.activate();
  }, [getToken, getWsUrl, loadInitialData, reloadMessages]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }

    setIsConnected(false);
  }, []);

  // Send message
  const sendMessage = useCallback(async (messageText) => {
    if (!messageText?.trim()) return false;

    const client = stompClientRef.current;
    if (!client || !client.connected) {
      setError('WebSocket not connected');
      return false;
    }

    try {
      const payload = {
        chatRoomId: chatRoomIdRef.current || null,
        messageText: messageText.trim()
      };

      client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(payload)
      });

      return true;
    } catch (err) {
      console.error('Send message error:', err);
      setError('Failed to send message');
      return false;
    }
  }, []);

  // Send image via REST API (POST /api/chat/upload-image with FormData)
  const sendImage = useCallback(async (file) => {
    if (!file) return false;

    try {
      const token = getToken();
      if (!token) { setError('No authentication token'); return false; }

      const fd = new FormData();
      fd.append('file', file);
      if (chatRoomIdRef.current) fd.append('chatRoomId', chatRoomIdRef.current);

      const response = await fetch(`${API_BASE}chat/upload-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || 'Failed to send image');
        return false;
      }

      // Server returns the saved message in result.data
      const msg = result.data;
      const transformedMsg = {
        id: msg.id,
        chatRoomId: msg.chatRoomId,
        senderId: msg.senderId,
        senderFullName: msg.senderFullName,
        senderType: 'user',
        content: msg.messageText,
        messageText: msg.messageText,
        imageUrl: msg.imageUrl || null,
        imageData: null,
        contentType: 'IMAGE',
        createdAt: msg.createdAt,
        isRead: true
      };

      // Update chatRoomId if not set
      if (msg.chatRoomId && !chatRoomIdRef.current) {
        setChatRoomId(msg.chatRoomId);
        chatRoomIdRef.current = msg.chatRoomId;
      }

      setMessages(prev => {
        const exists = prev.some(m => m.id === transformedMsg.id);
        if (exists) return prev;
        return [...prev, transformedMsg];
      });

      return true;
    } catch (err) {
      console.error('Send image error:', err);
      setError('Failed to send image');
      return false;
    }
  }, [getToken]);

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    try {
      await apiCall('chat/my/read', 'POST');

      // Update local state
      setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  }, [apiCall]);

  // Connect on mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      connect();
    } else {
      setIsLoading(false);
    }

    return () => {
      disconnect();
    };
  }, []);

  // Reconnect when token changes
  useEffect(() => {
    const handleStorageChange = () => {
      const token = getToken();
      if (token && !isConnected) {
        connect();
      } else if (!token && isConnected) {
        disconnect();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [getToken, isConnected, connect, disconnect]);

  return {
    // State
    isConnected,
    isLoading,
    error,
    messages,
    chatRoomId,
    userId,

    // Actions
    sendMessage,
    sendImage,
    markAsRead,
    connect,
    disconnect
  };
};

export default useChatStomp;
