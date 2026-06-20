# Tech Stack

## Решено

| Вопрос | Решение |
|--------|---------|
| Платформа | React SPA |
| Бэкенд | Нет — только клиент |
| Аккаунты | Нет |
| Хранение | localStorage + экспорт/импорт JSON |
| Локализация | i18n, en + ru на старте, расширяемо |

## Открытые вопросы

### React-экосистема

- **Сборщик**: Vite / CRA / Next.js (static export)?
  - Рекомендация: Vite — быстрый DX, SPA без лишнего
- **Стили**: Tailwind / CSS Modules / styled-components?
  - Tailwind удобен для print-версии (print: утилиты)
  - CSS Modules чище для компонентов с TTRPG-эстетикой
- **UI-библиотека**: Radix UI / shadcn/ui / headless / без библиотеки?
- **Стейт**: Zustand / Jotai / Context + useReducer?
  - Zustand — минимум бойлерплейта, хорошо для одного "персонажа в памяти"
- **i18n-библиотека**: react-i18next / i18next / lingui?
  - react-i18next — стандарт де-факто для React

### Формат данных

- JSON-схема для персонажа: версионирование (поле `schemaVersion`) с первого дня?
  - Рекомендация: да, иначе сложно делать миграции при изменении структуры
- Валидация при импорте: Zod / yup / ручная?

### Деплой

- Где хостим: GitHub Pages / Vercel / Netlify / self-hosted?
- Нужен ли домен?

### Печать

- CSS `@media print` + отдельный print-layout компонент?
- Или headless библиотека (react-to-print, @react-pdf/renderer)?
  - CSS print проще, достаточно для начала
  - react-pdf нужен если хотим скачивать PDF-файл, а не только Ctrl+P
