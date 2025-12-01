# MySQL Database Setup Guide

## ⚠️ Текущая проблема

Сервер пытается подключиться к MySQL базе данных `sql177.lh.pl`, но получает ошибку:
```
Access denied for user 'serwer399783_atEpic'@'public-gprs538854.centertel.pl' (using password: YES)
```

## 🔧 Решения

### 1. Проверьте настройки доступа в панели хостинга

На хостинге `lh.pl` нужно разрешить удаленный доступ:

1. Войдите в панель управления хостингом
2. Перейдите в раздел **MySQL Databases**
3. Найдите пользователя `serwer399783_atEpic`
4. Добавьте разрешение для удаленного подключения:
   - **Вариант 1:** Разрешить с любого IP: `%` или `0.0.0.0/0`
   - **Вариант 2:** Разрешить только с вашего IP (более безопасно)

### 2. Проверьте credentials

Убедитесь, что данные подключения правильные:

```env
DB_HOST=sql177.lh.pl
DB_USER=serwer399783_atEpic
DB_PASSWORD=gMqx=>M5VjArTMvr
DB_NAME=serwer399783_atEpic
```

### 3. Используйте локальный MySQL для разработки

Если удаленное подключение не работает, используйте локальный MySQL:

#### Установка MySQL (macOS)
```bash
brew install mysql
brew services start mysql
```

#### Создайте локальную базу данных
```bash
mysql -u root -p

CREATE DATABASE heroes_battle;
CREATE USER 'heroes_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON heroes_battle.* TO 'heroes_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Обновите .env для локального подключения
```env
DB_HOST=localhost
DB_USER=heroes_user
DB_PASSWORD=your_password
DB_NAME=heroes_battle
```

## 📋 Структура базы данных

Таблицы создаются автоматически при запуске сервера:

### Таблица `users`
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_guest TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Таблица `player_stats`
```sql
CREATE TABLE player_stats (
  user_id VARCHAR(255) PRIMARY KEY,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  games_played INT DEFAULT 0,
  total_damage BIGINT DEFAULT 0,
  total_kills INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 🚀 Запуск после настройки

1. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

2. Обновите `.env` с правильными credentials

3. Запустите сервер:
```bash
npm run dev
```

4. Вы должны увидеть:
```
✅ MySQL Database initialized
🚀 Server running on port 3000
```

## 🔒 Безопасность для Production

**Важно!** Для production окружения:

1. **Используйте переменные окружения** вместо хардкода
2. **Включите SSL для MySQL** соединения
3. **Хешируйте пароли** с помощью bcrypt
4. **Настройте firewall** на сервере MySQL
5. **Используйте сильные пароли** для БД

### Добавление SSL в DatabaseService.ts
```typescript
const DB_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};
```

## 📊 Преимущества MySQL vs SQLite

✅ **Удаленный доступ** - работает с любого сервера  
✅ **Масштабируемость** - поддерживает миллионы записей  
✅ **Надежность** - ACID транзакции  
✅ **Репликация** - автоматическое резервное копирование  
✅ **Производительность** - оптимизирован для многопользовательских приложений  

## 🆘 Troubleshooting

### Проблема: "Can't connect to MySQL server"
- Проверьте, что MySQL сервер запущен
- Проверьте firewall настройки
- Убедитесь, что хост доступен: `ping sql177.lh.pl`

### Проблема: "Access denied"
- Проверьте username и password
- Убедитесь, что пользователь имеет права доступа
- Проверьте настройки удаленного доступа

### Проблема: "Unknown database"
- Создайте базу данных вручную
- Проверьте название базы данных в .env

## 📞 Контакты хостинга

Если проблема не решается, свяжитесь с поддержкой `lh.pl`:
- Укажите, что нужен удаленный доступ к MySQL
- Попросите добавить ваш IP в whitelist
- Уточните правильный хост для подключения
