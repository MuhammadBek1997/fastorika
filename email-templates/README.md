# Email Templates - Fastorika

Эта папка содержит HTML email шаблоны для отправки через backend.

## 📁 Структура файлов

```
email-templates/
├── activation-email-ru.html    # Русская версия
├── activation-email-en.html    # Английская версия
└── README.md                    # Документация
```

## 🎨 Возможности

- ✅ **Dark/Light Mode Support** - автоматически адаптируется под системные настройки пользователя
- ✅ **Mobile Responsive** - отлично выглядит на всех устройствах
- ✅ **Inline CSS** - совместимость со всеми email клиентами
- ✅ **Cross-platform** - работает в Gmail, Outlook, Apple Mail, и т.д.

## 🔧 Интеграция с Backend

### Переменные для замены

В шаблонах используются следующие placeholder'ы, которые нужно заменить на реальные значения:

| Placeholder | Описание | Пример |
|------------|----------|--------|
| `{{CODE}}` | Код подтверждения (5 цифр) | `12345` |
| `{{VERIFICATION_LINK}}` | Ссылка для подтверждения email | `https://fastorika.com/verify?token=xxx` |
| `{{UNSUBSCRIBE_LINK}}` | Ссылка для отписки от рассылки | `https://fastorika.com/unsubscribe?id=xxx` |

### Пример использования (Node.js)

```javascript
const fs = require('fs');
const nodemailer = require('nodemailer');

// Читаем шаблон
const templateRU = fs.readFileSync('./email-templates/activation-email-ru.html', 'utf8');

// Заменяем переменные
const emailHTML = templateRU
  .replace('{{CODE}}', '12345')
  .replace('{{VERIFICATION_LINK}}', 'https://fastorika.com/verify?token=abc123')
  .replace('{{UNSUBSCRIBE_LINK}}', 'https://fastorika.com/unsubscribe?id=user123');

// Отправляем email
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-password'
  }
});

await transporter.sendMail({
  from: '"Fastorika" <noreply@fastorika.com>',
  to: 'user@example.com',
  subject: 'Подтвердите почту - Fastorika',
  html: emailHTML
});
```

### Пример для Spring Boot (Java)

```java
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import javax.mail.internet.MimeMessage;
import java.nio.file.Files;
import java.nio.file.Paths;

public class EmailService {

    private final JavaMailSender mailSender;

    public void sendVerificationEmail(String to, String code, String verificationLink) throws Exception {
        // Читаем шаблон
        String template = new String(Files.readAllBytes(
            Paths.get("email-templates/activation-email-ru.html")
        ));

        // Заменяем переменные
        String emailHTML = template
            .replace("{{CODE}}", code)
            .replace("{{VERIFICATION_LINK}}", verificationLink)
            .replace("{{UNSUBSCRIBE_LINK}}", "https://fastorika.com/unsubscribe?id=" + userId);

        // Отправляем email
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("noreply@fastorika.com", "Fastorika");
        helper.setTo(to);
        helper.setSubject("Подтвердите почту - Fastorika");
        helper.setText(emailHTML, true); // true = HTML content

        mailSender.send(message);
    }
}
```

### Пример для Python (Django/Flask)

```python
from django.core.mail import EmailMessage
from pathlib import Path

def send_verification_email(to_email, code, verification_link, user_id):
    # Читаем шаблон
    template_path = Path('email-templates/activation-email-ru.html')
    template = template_path.read_text(encoding='utf-8')

    # Заменяем переменные
    email_html = template.replace('{{CODE}}', code)
    email_html = email_html.replace('{{VERIFICATION_LINK}}', verification_link)
    email_html = email_html.replace('{{UNSUBSCRIBE_LINK}}', f'https://fastorika.com/unsubscribe?id={user_id}')

    # Отправляем email
    email = EmailMessage(
        subject='Подтвердите почту - Fastorika',
        body=email_html,
        from_email='noreply@fastorika.com',
        to=[to_email],
    )
    email.content_subtype = 'html'  # Указываем что это HTML
    email.send()
```

## 🌐 Выбор языка

Используйте нужный шаблон в зависимости от языка пользователя:

```javascript
// Получаем язык пользователя из БД или настроек
const userLanguage = user.preferredLanguage; // 'ru' или 'en'

// Выбираем шаблон
const templateFile = userLanguage === 'ru'
  ? './email-templates/activation-email-ru.html'
  : './email-templates/activation-email-en.html';

const template = fs.readFileSync(templateFile, 'utf8');
```

## 📝 Важные замечания

1. **JavaScript не работает в email** - шаблоны используют только HTML и inline CSS
2. **Dark Mode** - автоматически работает через `@media (prefers-color-scheme: dark)`
3. **Тестирование** - обязательно протестируйте в разных email клиентах (Gmail, Outlook, Apple Mail)
4. **Безопасность** - не передавайте чувствительные данные в URL параметрах
5. **SMTP настройки** - убедитесь что настроили SMTP сервер для отправки писем

## 🧪 Тестирование

Для тестирования можете использовать:
- [Litmus](https://litmus.com/) - платный сервис для тестирования email
- [Email on Acid](https://www.emailonacid.com/) - платный сервис
- [Mailtrap](https://mailtrap.io/) - бесплатный для разработки
- Просто откройте HTML файл в браузере для быстрой проверки

## 📧 SMTP Сервисы

Рекомендуемые сервисы для отправки email:

1. **SendGrid** - до 100 писем/день бесплатно
2. **AWS SES** - недорого для больших объемов
3. **Mailgun** - хорошо для transactional emails
4. **Brevo (Sendinblue)** - до 300 писем/день бесплатно

## 🎯 Следующие шаги

1. Выберите SMTP провайдера
2. Настройте email отправку в вашем backend
3. Замените `{{PLACEHOLDERS}}` на реальные данные
4. Протестируйте отправку на тестовый email
5. Проверьте dark/light режимы в разных клиентах

---

**Автор:** Frontend Team
**Последнее обновление:** 2026-01-23
