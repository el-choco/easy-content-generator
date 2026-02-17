# 🚀 Easy Content Generator

**AI-powered content generation tool with multi-language support, templates, and export functionality**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen)

---

## ✨ Features

### 🤖 AI Content Generation
- **Powered by Google Gemini AI** - State-of-the-art content generation
- **Real-time Content Creation** - Generate high-quality content instantly
- **Multi-Language Support** - Create content in 6+ languages:
  - 🇬🇧 English
  - 🇩🇪 Deutsch (German)
  - 🇫🇷 Français (French)
  - 🇪🇸 Español (Spanish)
  - 🇮🇹 Italiano (Italian)
  - 🇵🇹 Português (Portuguese)

### 📚 Templates System
- **10+ Pre-defined Templates** per language:
  - 📝 Blog Posts
  - 📧 Email Newsletters
  - 📱 Social Media Posts (Instagram, Twitter, Facebook, TikTok)
  - 🛍️ Product Descriptions
  - 💼 Job Descriptions
  - 📢 Press Releases
  - 📰 Newsletter Content
- **Create Custom Templates** - Save your own templates for reuse
- **Template Management** - Edit, delete, and organize templates

### 🎨 Tone/Style Control
Generate content with different writing styles:
- **💼 Professional** - Formal, structured, business-appropriate
- **😊 Casual** - Friendly, conversational, relaxed
- **✨ Creative** - Imaginative, engaging, artistic
- **🔧 Technical** - Detailed, precise, specialized terminology

### ✏️ Content Editing
- **Edit Before Saving** - Refine generated content in real-time
- **Edit After Saving** - Modify saved content anytime
- **Live Preview** - See changes instantly
- **Flexible Workflow** - Full control over your content

### 📥 Export Functionality
Download your content in multiple formats:
- **📄 PDF Export** - Professional formatted documents
- **📝 Word Export** (.docx) - Microsoft Word compatible
- **✍️ Markdown Export** (.md) - Perfect for developers & bloggers

### 💾 Content Management
- **History Tracking** - View all generated content
- **Content Organization** - Browse and manage your content library
- **Quick Delete** - Remove unwanted content
- **Metadata Tracking** - Language and tone information preserved

### 🌍 Multi-Language UI
Switch between 6 languages instantly:
- Complete UI translation
- Language-specific templates
- Localized content generation

---

## 🏗️ Tech Stack

### Frontend
- ⚛️ React 18+
- 📘 TypeScript
- 🎨 Tailwind CSS
- 🌐 i18next (Internationalization)
- 🔌 Axios (API Client)

### Backend
- 🐍 FastAPI (Python)
- 🗄️ PostgreSQL
- 📚 SQLAlchemy (ORM)
- 🤖 Google Generative AI (Gemini)
- 📄 python-docx (Word generation)
- 📋 reportlab (PDF generation)

### Infrastructure
- 🐳 Docker & Docker Compose
- 🌐 Nginx (Reverse Proxy)
- 💾 PostgreSQL Database

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Google Gemini API Key
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/el-choco/easy-content-generator.git
cd easy-content-generator
```

2. **Create environment file**
```bash
cat > backend/.env << EOF
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql://user:password@db:5432/mydatabase
EOF
```

3. **Start with Docker Compose**
```bash
docker-compose up --build -d
```

4. **Access the application**
- Frontend: http://localhost:3223
- Backend API: http://localhost:8118
- API Docs: http://localhost:8118/docs

---

## 📁 Project Structure

```
easy-content-generator/
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main React component
│   │   ├── App.css          # Styling
│   │   └── index.tsx        # Entry point
│   ├── public/
│   │   └── locales/         # i18n translations
│   │       ├── en/
│   │       ├── de/
│   │       ├── fr/
│   │       ├── es/
│   │       ├── it/
│   │       └── pt/
│   └── Dockerfile
│
├── backend/
│   ├── app.py               # FastAPI application
│   ├── models.py            # Database models
│   ├── database.py          # Database configuration
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile
│
├── docker-compose.yml       # Docker orchestration
└── README.md               # This file
```

---

## 🔌 API Endpoints

### Content Generation
```
POST /generate
  Parameters:
    - prompt (string): Content prompt
    - language (string): Target language
    - tone (string): Writing style
  
  Response:
    {
      "id": 1,
      "prompt": "...",
      "content": "...",
      "language": "en",
      "tone": "professional"
    }
```

### Content Management
```
GET  /history              # Get all content
GET  /content/{id}         # Get specific content
PUT  /content/{id}         # Update content
DELETE /content/{id}       # Delete content
```

### Export
```
GET /export/{id}/pdf       # Export as PDF
GET /export/{id}/docx      # Export as Word
GET /export/{id}/markdown  # Export as Markdown
```

### Templates
```
GET  /templates                    # Get all templates
POST /templates                    # Create custom template
DELETE /templates/{id}            # Delete template
```

### System
```
GET /languages  # Get supported languages
GET /tones      # Get supported tones
GET /health     # Health check
```

---

## 🎯 Usage Example

### 1. Generate Content
```
1. Select Language (e.g., English)
2. Select Tone (e.g., Professional)
3. Choose Template or write custom prompt
4. Click "Generate Content"
```

### 2. Edit & Refine
```
1. Click "Edit Content" button
2. Modify title and body
3. Click "Save Changes"
```

### 3. Export
```
1. Click on content from history
2. Select export format (PDF/Word/Markdown)
3. File downloads automatically
```

### 4. Manage Templates
```
1. Click "Create New Template"
2. Fill in name, category, and prompt
3. Template saved for future use
4. Delete with ✕ button if needed
```

---

## 🌐 Supported Languages

| Language | Code | Status |
|----------|------|--------|
| English | `en` | ✅ Full Support |
| Deutsch | `de` | ✅ Full Support |
| Français | `fr` | ✅ Full Support |
| Español | `es` | ✅ Full Support |
| Italiano | `it` | ✅ Full Support |
| Português | `pt` | ✅ Full Support |

---

## 🎨 Available Tones

| Tone | Use Case |
|------|----------|
| 💼 **Professional** | Business, formal documents, corporate content |
| 😊 **Casual** | Social media, blogs, friendly communication |
| ✨ **Creative** | Marketing, storytelling, artistic content |
| 🔧 **Technical** | Documentation, technical guides, detailed specs |

---

## 📋 Template Categories

- 📝 **Blog** - Blog posts and articles
- 📧 **Email** - Email newsletters and campaigns
- 📱 **Social** - Social media content (Instagram, Twitter, Facebook, TikTok)
- 🛍️ **Product** - Product descriptions and marketing
- 💼 **HR** - Job descriptions and HR content
- 📢 **PR** - Press releases and public relations

---

## 🔐 Environment Variables

```env
# Google Gemini API
GEMINI_API_KEY=your_api_key_here

# Database
DATABASE_URL=postgresql://user:password@db:5432/mydatabase
DATABASE_USER=user
DATABASE_PASSWORD=password

# Redis (optional)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
```

---

## 🐳 Docker Commands

```bash
# Start containers
docker-compose up --build -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Clean everything (reset database)
docker-compose down -v
docker-compose up --build
```

---

## 📊 Database Schema

### Users Table
```sql
- id: INTEGER (Primary Key)
- username: STRING (Unique)
- email: STRING (Unique)
- created_at: DATETIME
```

### Content Table
```sql
- id: INTEGER (Primary Key)
- title: STRING
- body: TEXT
- language: STRING
- tone: STRING
- owner_id: INTEGER (Foreign Key → users.id)
- created_at: DATETIME
```

### Templates Table
```sql
- id: INTEGER (Primary Key)
- name: STRING
- category: STRING
- prompt: TEXT
- language: STRING
- is_default: INTEGER (0=custom, 1=default)
- owner_id: INTEGER (Foreign Key → users.id)
- created_at: DATETIME
```

---

## 🚀 Performance Features

- ✅ **Fast API Responses** - Optimized FastAPI backend
- ✅ **Streaming Content** - Real-time generation updates
- ✅ **Caching** - Efficient data retrieval
- ✅ **Database Indexing** - Optimized queries
- ✅ **Docker Optimization** - Minimal image sizes

---

## 🔄 Upcoming Features

- 👤 User Authentication & Accounts
- 🔗 Share & Public Links
- 📊 Analytics & Statistics
- ⭐ Favorites/Bookmarks
- 🔄 Batch Generation
- ☁️ Cloud Storage Integration
- 🎨 Theme Customization
- 🔌 Webhook Support

---

## 🛠️ Development

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

---

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

For support, email support@example.com or open an issue on GitHub.

---

## 🙏 Acknowledgments

- [Google Generative AI](https://ai.google.dev/) - AI Backend
- [FastAPI](https://fastapi.tiangolo.com/) - Web Framework
- [React](https://react.dev/) - Frontend Framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [i18next](https://www.i18next.com/) - Internationalization

---

## 📈 Stats

- 📝 Languages Supported: 6+
- 📚 Pre-built Templates: 60+ (10 per language)
- 🎨 Tone Styles: 4
- 📥 Export Formats: 3 (PDF, DOCX, MD)
- 🌍 UI Languages: 6
- ⚡ Average Response Time: <5 seconds

---

**Made with ❤️ by the Easy Content Generator Team**

Last Updated: 2026-02-17

---

### Quick Links

- 🌐 [Visit Website](http://localhost:3223)
- 📚 [API Documentation](http://localhost:8118/docs)
- 🐛 [Report Issues](https://github.com/yourusername/easy-content-generator/issues)
- 💬 [Discussions](https://github.com/yourusername/easy-content-generator/discussions)