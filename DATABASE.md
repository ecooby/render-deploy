# Database Structure

Heroes Battle использует SQLite для хранения данных игроков.

## Таблицы

### users
Хранит информацию об аккаунтах игроков.

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,              -- UUID игрока
  username TEXT UNIQUE NOT NULL,    -- Уникальное имя пользователя
  password TEXT NOT NULL,           -- Пароль (в production должен быть хэширован)
  is_guest INTEGER DEFAULT 0,       -- Флаг гостевого аккаунта (0 или 1)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### player_stats
Хранит статистику игрока.

```sql
CREATE TABLE player_stats (
  user_id TEXT PRIMARY KEY,         -- ID игрока (foreign key)
  wins INTEGER DEFAULT 0,           -- Количество побед
  losses INTEGER DEFAULT 0,         -- Количество поражений
  games_played INTEGER DEFAULT 0,   -- Всего игр сыграно
  total_damage INTEGER DEFAULT 0,   -- Общий нанесенный урон
  total_kills INTEGER DEFAULT 0,    -- Общее количество убийств
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

## Файл базы данных

База данных хранится в: `server/data/heroes_battle.db`

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация нового аккаунта
- `POST /api/auth/login` - Вход в аккаунт
- `POST /api/auth/guest` - Вход как гость

### Статистика
- `GET /api/player/stats/:userId` - Получить статистику игрока

## Особенности

1. **Кросс-платформенность**: Один аккаунт можно использовать на любом клиенте (Web, iOS)
2. **Гостевые аккаунты**: Создаются временные аккаунты для быстрого старта
3. **Автоматическое обновление статистики**: После каждой битвы статистика обновляется автоматически
4. **Легковесность**: SQLite не требует отдельного сервера БД

## TODO для Production

- [ ] Добавить bcrypt для хеширования паролей
- [ ] Добавить JWT токены для аутентификации
- [ ] Добавить миграции для управления схемой БД
- [ ] Добавить индексы для оптимизации запросов
- [ ] Рассмотреть переход на PostgreSQL для масштабирования
