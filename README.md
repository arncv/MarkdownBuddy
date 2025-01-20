# MarkdownBuddy 📝

MarkdownBuddy is a real-time collaborative Markdown editor that allows multiple users to work on documents simultaneously. With a modern interface and powerful features, it makes document collaboration seamless and efficient.

## ✨ Features

- **Real-time Collaboration**: Multiple users can edit documents simultaneously
- **Live Preview**: See your Markdown rendered in real-time
- **Version Control**: Built-in versioning to prevent conflicts
- **User Authentication**: Secure user accounts and document access
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Rich Markdown Support**: Full Markdown syntax support with live preview
- **Document Management**: Create, organize, and share documents easily

## 🚀 Tech Stack

- **Frontend**:
  - React with TypeScript
  - Tailwind CSS for styling
  - CodeMirror for the editor
  - Socket.IO client for real-time updates
  - Vite for development and building

- **Backend**:
  - Node.js with Express
  - TypeScript
  - Socket.IO for real-time communication
  - JWT for authentication

## 🛠️ Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/markdownbuddy.git
cd markdownbuddy
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. **Environment Setup**

Create `.env` files in both frontend and backend directories:

Frontend `.env`:
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

Backend `.env`:
```env
PORT=3000
JWT_SECRET=your_jwt_secret_here
```

4. **Start the Development Servers**

In the backend directory:
```bash
npm run dev
```

In the frontend directory:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Development

### Project Structure

```
markdownbuddy/
├── frontend/                # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── contexts/       # React context providers
│   │   ├── pages/         # Page components
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   └── ...
├── backend/                # Backend Node.js server
│   ├── src/
│   │   ├── middleware/    # Express middlewares
│   │   ├── models/        # Data models
│   │   ├── routes/        # API routes
│   │   └── utils/         # Utility functions
│   └── ...
└── ...
```

### Running Tests

```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
npm test
```

## 📝 Usage

1. **Registration/Login**
   - Create an account or log in to access your documents

2. **Creating Documents**
   - Click "New Document" from the dashboard
   - Enter a title for your document
   - Start writing in Markdown

3. **Collaborating**
   - Share your document ID with collaborators
   - See real-time updates as others edit
   - Changes are automatically saved

4. **Markdown Features**
   - Headers (# H1, ## H2, etc.)
   - Lists (ordered and unordered)
   - Code blocks with syntax highlighting
   - Tables
   - Links and images
   - And more!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Editor powered by [CodeMirror](https://codemirror.net/)
- Real-time updates with [Socket.IO](https://socket.io/)