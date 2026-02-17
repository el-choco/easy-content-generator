import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './App.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AdminPage } from './pages/AdminPage';  

interface Content {
  id: number;
  title: string;
  body: string;
  language?: string;
  tone?: string;
  created_at?: string;
}

interface Template {
  id: string | number;
  name: string;
  category: string;
  prompt: string;
  language: string;
  is_default: boolean;
  owner_id?: number;
}

interface User {
  id: number;
  username: string;
  email: string;
}

interface Languages {
  [key: string]: string;
}

interface Tones {
  [key: string]: string;
}

type PreviewMode = 'normal' | 'mobile' | 'tablet' | 'fullscreen';

function App() {
  const { t, i18n } = useTranslation();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState<'main' | 'admin'>('main');
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');
  
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [history, setHistory] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [language, setLanguage] = useState('en');
  const [tone, setTone] = useState('professional');
  const [languages, setLanguages] = useState<Languages>({});
  const [tones, setTones] = useState<Tones>({});
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('blog');
  const [newTemplatePrompt, setNewTemplatePrompt] = useState('');
  const [exporting, setExporting] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  const [isEditingGenerated, setIsEditingGenerated] = useState(false);
  const [editedGeneratedTitle, setEditedGeneratedTitle] = useState('');
  const [editedGeneratedBody, setEditedGeneratedBody] = useState('');
  const [isEditingSelected, setIsEditingSelected] = useState(false);
  const [editedSelectedTitle, setEditedSelectedTitle] = useState('');
  const [editedSelectedBody, setEditedSelectedBody] = useState('');
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [previewMode, setPreviewMode] = useState<PreviewMode>('normal');
  const [showPreview, setShowPreview] = useState(false);

  const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8118`;

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      verifyToken(token);
    } else {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchLanguages();
      fetchTones();
      fetchHistory();
      fetchTemplates();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchTemplates();
    }
  }, [i18n.language, isLoggedIn]);

  const verifyToken = async (token: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      });
      setCurrentUser(response.data);
      setIsLoggedIn(true);
      setIsAdmin(response.data.is_admin === true);
      setAuthError('');
    } catch (err) {
      console.error('Token verification failed:', err);
      localStorage.removeItem('access_token');
      setIsLoggedIn(false);
      setCurrentUser(null);
      setIsAdmin(false);
    } finally {
      setAuthLoading(false);
    }
  };

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setAuthLoading(true);
  setAuthError('');

  if (!loginUsername || !loginPassword) {
    setAuthError(t('auth.fillAllFields') || 'Please fill all fields');
    setAuthLoading(false);
    return;
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, null, {
      params: {
        username: loginUsername,
        password: loginPassword
      },
      timeout: 10000
    });

    const token = response.data.access_token;
    localStorage.setItem('access_token', token); 
    
    await verifyToken(token);
    
    setLoginUsername('');
    setLoginPassword('');
    setAuthError('');
  } catch (err: any) {
    setAuthError(err.response?.data?.detail || t('auth.loginError') || 'Login failed');
  } finally {
    setAuthLoading(false);
  }
};

const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setAuthLoading(true);
  setAuthError('');

  if (!registerUsername || !registerEmail || !registerPassword || !registerPasswordConfirm) {
    setAuthError(t('auth.fillAllFields') || 'Please fill all fields');
    setAuthLoading(false);
    return;
  }

  if (registerPassword !== registerPasswordConfirm) {
    setAuthError(t('auth.passwordMismatch') || 'Passwords do not match');
    setAuthLoading(false);
    return;
  }

  if (registerPassword.length < 6) {
    setAuthError(t('auth.passwordTooShort') || 'Password must be at least 6 characters');
    setAuthLoading(false);
    return;
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, null, {
      params: {
        username: registerUsername,
        email: registerEmail,
        password: registerPassword
      },
      timeout: 10000
    });

    const token = response.data.access_token;
    localStorage.setItem('access_token', token);
    
    await verifyToken(token);
    
    setRegisterUsername('');
    setRegisterEmail('');
    setRegisterPassword('');
    setRegisterPasswordConfirm('');
    setAuthError('');
  } catch (err: any) {
    setAuthError(err.response?.data?.detail || t('auth.registerError') || 'Registration failed');
  } finally {
    setAuthLoading(false);
  }
};

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsAdmin(false);
    setCurrentPage('main');
    setHistory([]);
    setSelectedContent(null);
    setGeneratedContent('');
    setPrompt('');
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('access_token');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchLanguages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/languages`, {
        timeout: 10000
      });
      setLanguages(response.data.languages);
    } catch (err) {
      console.error('Error fetching languages:', err);
      setLanguages({
        en: 'English',
        de: 'Deutsch',
        fr: 'Français',
        es: 'Español',
        it: 'Italiano',
        pt: 'Português',
      });
    }
  };

  const fetchTones = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tones`, {
        timeout: 10000
      });
      setTones(response.data.tones);
    } catch (err) {
      console.error('Error fetching tones:', err);
      setTones({
        professional: 'Professional - Formal, structured, business-appropriate tone',
        casual: 'Casual - Friendly, conversational, relaxed tone',
        creative: 'Creative - Imaginative, engaging, artistic tone',
        technical: 'Technical - Detailed, precise, specialized terminology'
      });
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history`, {
        headers: getAuthHeader(),
        timeout: 30000
      });
      setHistory(response.data);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(t('error.fetchHistory') || 'Failed to fetch history');
    }
  };

  const fetchTemplates = async () => {
    try {
      const langCode = i18n.language.split('-')[0]; // "de-DE" → "de"
      const response = await axios.get(`${API_BASE_URL}/templates`, {
        params: { language: langCode },
        headers: getAuthHeader(),
        timeout: 10000
      });
      setTemplates(response.data);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(t('error.fetchTemplates') || 'Failed to fetch templates');
    }
  };

  const handleGenerateLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  const handleToneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTone(e.target.value);
  };

  const handleUILanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
  };

  const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);

    if (templateId) {
      const template = templates.find(t => String(t.id) === templateId);
      if (template) {
        setPrompt(template.prompt);
      }
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError(t('error.emptyPrompt') || 'Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedContent('');

    try {
      const response = await axios.post(`${API_BASE_URL}/generate`, null, {
        params: { 
          prompt,
          language,
          tone
        },
        headers: getAuthHeader(),
        timeout: 120000
      });
      
      setGeneratedContent(response.data.content);
      setPrompt('');
      setSelectedTemplate('');
      
      fetchHistory();
    } catch (err: any) {
      setError(err.response?.data?.detail || t('error.generateError') || 'Generation failed');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTemplateName.trim() || !newTemplatePrompt.trim()) {
      setError(t('error.emptyPrompt') || 'Please fill all fields');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/templates`, null, {
        params: {
          name: newTemplateName,
          category: newTemplateCategory,
          prompt: newTemplatePrompt,
          language: i18n.language
        },
        headers: getAuthHeader(),
        timeout: 10000
      });

      setNewTemplateName('');
      setNewTemplateCategory('blog');
      setNewTemplatePrompt('');
      setShowTemplateForm(false);
      fetchTemplates();
    } catch (err: any) {
      setError(err.response?.data?.detail || t('error.createTemplate') || 'Failed to create template');
      console.error('Error:', err);
    }
  };

  const handleDeleteTemplate = async (templateId: string | number) => {
    if (!window.confirm(t('templates.deleteConfirm') || 'Are you sure?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/templates/${templateId}`, {
        headers: getAuthHeader(),
        timeout: 10000
      });
      fetchTemplates();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || t('error.deleteTemplate') || 'Failed to delete template');
      console.error('Error:', err);
    }
  };

  const handleDelete = async (contentId: number) => {
    if (!window.confirm(t('content.deleteConfirm') || 'Are you sure?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/content/${contentId}`, {
        headers: getAuthHeader(),
        timeout: 10000
      });
      fetchHistory();
      if (selectedContent?.id === contentId) {
        setSelectedContent(null);
      }
      setError('');
    } catch (err) {
      setError(t('error.deleteError') || 'Failed to delete content');
      console.error('Error:', err);
    }
  };

  const handleSelectContent = async (contentId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/content/${contentId}`, {
        headers: getAuthHeader(),
        timeout: 10000
      });
      setSelectedContent(response.data);
    } catch (err) {
      setError(t('error.loadContent') || 'Failed to load content');
      console.error('Error:', err);
    }
  };

  const handleEditGeneratedContent = () => {
    setEditedGeneratedTitle(prompt);
    setEditedGeneratedBody(generatedContent);
    setIsEditingGenerated(true);
  };

  const handleSaveGeneratedContent = async () => {
    setLoading(true);
    try {
      setPrompt(editedGeneratedTitle);
      setGeneratedContent(editedGeneratedBody);
      setIsEditingGenerated(false);
      fetchHistory();
    } catch (err: any) {
      setError(t('error.generateError') || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSelectedContent = () => {
    if (!selectedContent) return;
    setEditedSelectedTitle(selectedContent.title);
    setEditedSelectedBody(selectedContent.body);
    setIsEditingSelected(true);
  };

  const handleSaveSelectedContent = async () => {
    if (!selectedContent) return;
    
    setLoading(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/content/${selectedContent.id}`, null, {
        params: {
          title: editedSelectedTitle,
          body: editedSelectedBody
        },
        headers: getAuthHeader(),
        timeout: 10000
      });

      setSelectedContent({
        ...selectedContent,
        title: response.data.title,
        body: response.data.body
      });
      setIsEditingSelected(false);
      fetchHistory();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || t('error.updateError') || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'markdown', contentId: number) => {
    setExporting(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/export/${contentId}/${format}`, {
        headers: getAuthHeader(),
        responseType: 'blob',
        timeout: 30000
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      let filename = selectedContent?.title.replace(/\s+/g, '_') || 'content';
      if (format === 'pdf') {
        link.setAttribute('download', `${filename}.pdf`);
      } else if (format === 'docx') {
        link.setAttribute('download', `${filename}.docx`);
      } else if (format === 'markdown') {
        link.setAttribute('download', `${filename}.md`);
      }

      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Export failed: ' + (err.message || 'Unknown error'));
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleCopyToClipboard = (text: string, contentId?: number) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (success) {
        setCopiedId(contentId || -1);
        
        setTimeout(() => {
          setCopiedId(null);
        }, 2000);
      } else {
        setError(t('clipboard.copyError') || 'Copy failed');
      }
    } catch (err) {
      console.error('Copy error:', err);
      setError(t('clipboard.copyError') || 'Copy failed');
    }
  };

  const getPreviewContainerClass = () => {
    switch (previewMode) {
      case 'mobile':
        return 'max-w-sm mx-auto border-8 border-gray-900 rounded-3xl';
      case 'tablet':
        return 'max-w-2xl mx-auto border-8 border-gray-900 rounded-2xl';
      case 'fullscreen':
        return 'w-full';
      default:
        return 'w-full';
    }
  };

const PreviewComponent = ({ content, title }: { content: string; title: string }) => {
  const getContainerClass = () => {
    switch (previewMode) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      case 'fullscreen':
        return 'w-full';
      default:
        return 'w-full';
    }
  };

  return (
    <div className={getContainerClass()}>
      <div className={`p-8 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg`}>
        <h2 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {title}
        </h2>
        <div className={`prose ${isDarkMode ? 'prose-invert' : ''} max-w-none ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

  const defaultTemplates = templates.filter(t => t.is_default);
  const customTemplates = templates.filter(t => !t.is_default);

  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
        <div className="text-center">
          <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Easy Content Generator</h1>
          <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md">
            <div className={`rounded-lg shadow-lg p-8 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <h1 className={`text-4xl font-bold mb-2 text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                🚀 Easy Content Generator
              </h1>
              <p className={`text-center mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                AI-Powered Content Generation
              </p>

              {authError && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {authError}
                </div>
              )}

              {showLoginForm ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Username</label>
                    <input
                      type="text"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'}`}
                      disabled={authLoading}
                    />
                  </div>

                  <div>
                    <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'}`}
                      disabled={authLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    {authLoading ? 'Logging in...' : 'Login'}
                  </button>

                  <p className={`text-center mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setShowLoginForm(false)}
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Register here
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Username</label>
                    <input
                      type="text"
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'}`}
                      disabled={authLoading}
                    />
                  </div>

                  <div>
                    <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'}`}
                      disabled={authLoading}
                    />
                  </div>

                  <div>
                    <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                    <input
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'}`}
                      disabled={authLoading}
                    />
                  </div>

                  <div>
                    <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirm Password</label>
                    <input
                      type="password"
                      value={registerPasswordConfirm}
                      onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'}`}
                      disabled={authLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    {authLoading ? 'Registering...' : 'Register'}
                  </button>

                  <p className={`text-center mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setShowLoginForm(true)}
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Login here
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showPreview && (generatedContent || selectedContent)) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              👁️ Preview Mode
            </h1>
            <button
              onClick={() => setShowPreview(false)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              ✕ Close Preview
            </button>
          </div>

          <div className={`mb-6 flex gap-2 flex-wrap ${isDarkMode ? 'bg-slate-800' : 'bg-white'} p-4 rounded-lg`}>
            <button
              onClick={() => setPreviewMode('normal')}
              className={`font-bold py-2 px-4 rounded-lg transition ${
                previewMode === 'normal'
                  ? 'bg-blue-600 text-white'
                  : isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              💻 Normal
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`font-bold py-2 px-4 rounded-lg transition ${
                previewMode === 'mobile'
                  ? 'bg-blue-600 text-white'
                  : isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              📱 Mobile
            </button>
            <button
              onClick={() => setPreviewMode('tablet')}
              className={`font-bold py-2 px-4 rounded-lg transition ${
                previewMode === 'tablet'
                  ? 'bg-blue-600 text-white'
                  : isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              📱 Tablet
            </button>
            <button
              onClick={() => setPreviewMode('fullscreen')}
              className={`font-bold py-2 px-4 rounded-lg transition ${
                previewMode === 'fullscreen'
                  ? 'bg-blue-600 text-white'
                  : isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              ⛶ Fullscreen
            </button>
          </div>

          <div className={`${previewMode === 'fullscreen' ? '' : 'overflow-auto max-h-96'}`}>
              {generatedContent ? (
                <PreviewComponent content={generatedContent} title={prompt || 'Generated Content'} />
              ) : selectedContent ? (
                <PreviewComponent content={selectedContent.body} title={selectedContent.title} />
              ) : (
                <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p className="text-xl">No content to preview</p>
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }
    if (isAdmin && currentPage === 'admin') {
      return (
        <AdminPage 
          isDarkMode={isDarkMode} 
          onLogout={handleLogout}
          onBackToMain={() => setCurrentPage('main')}
        />
      );
    }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`px-3 py-2 rounded-lg font-bold transition ${
                isDarkMode 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-slate-900' 
                  : 'bg-slate-700 hover:bg-slate-800 text-yellow-300'
              }`}
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <select
              value={i18n.language}
              onChange={handleUILanguageChange}
              className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'}`}
            >
              <option value="en">🇬🇧 English</option>
              <option value="de">🇩🇪 Deutsch</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="es">🇪🇸 Español</option>
              <option value="it">🇮🇹 Italiano</option>
              <option value="pt">🇵🇹 Português</option>
            </select>
          <div className="flex items-center gap-4">
            <span className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>👤 {currentUser?.username}</span>
            {isAdmin && (
              <button
                onClick={() => setCurrentPage(currentPage === 'admin' ? 'main' : 'admin')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-4 rounded-lg transition"
              >
                🛡️ Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-4 rounded-lg transition"
            >
              Logout
            </button>
          </div>
          </div>
          <h1 className={`text-5xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {t('header.title')}
          </h1>
          <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('header.subtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className={`rounded-lg shadow-lg p-8 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {t('form.prompt')}
              </h2>

              <form onSubmit={handleGenerate} className="mb-6">
                <div className="mb-4">
                  <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('form.language')}
                  </label>
                  <select
                    value={language}
                    onChange={handleGenerateLanguageChange}
                    disabled={loading}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'}`}
                  >
                    {Object.entries(languages).map(([code, name]) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('form.tone')}
                  </label>
                  <select
                    value={tone}
                    onChange={handleToneChange}
                    disabled={loading}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'}`}
                  >
                    {Object.entries(tones).map(([key, value]) => (
                      <option key={key} value={key}>
                        {t(`tones.${key}`)}
                      </option>
                    ))}
                  </select>
                  {tones[tone] && (
                    <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{tones[tone]}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('form.template')}
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={handleTemplateSelect}
                    disabled={loading}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'}`}
                  >
                    <option value="">{t('form.templatePlaceholder')}</option>
                    {defaultTemplates.length > 0 && (
                      <optgroup label={t('templates.default')}>
                        {defaultTemplates.map(template => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {customTemplates.length > 0 && (
                      <optgroup label={t('templates.custom')}>
                        {customTemplates.map(template => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                <div className="mb-4">
                  <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('form.prompt')}
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t('form.placeholder')}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'}`}
                    rows={4}
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                >
                  {loading ? t('form.generating') : t('form.generate')}
                </button>
              </form>

              {generatedContent && (
                <div className={`mt-8 p-6 rounded-lg border-2 border-green-500 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {t('content.generatedTitle')}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowPreview(true)}
                        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-1 px-3 rounded text-sm transition"
                      >
                        👁️ Preview
                      </button>
                      {!isEditingGenerated && (
                        <button
                          onClick={handleEditGeneratedContent}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm transition"
                        >
                          ✏️ {t('content.editButton')}
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditingGenerated ? (
                    <div>
                      <div className="mb-4">
                        <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('content.title')}
                        </label>
                        <input
                          type="text"
                          value={editedGeneratedTitle}
                          onChange={(e) => setEditedGeneratedTitle(e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-600 border-slate-600 text-white' : 'border-gray-300'}`}
                        />
                      </div>

                      <div className="mb-4">
                        <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('form.prompt')}
                        </label>
                        <textarea
                          value={editedGeneratedBody}
                          onChange={(e) => setEditedGeneratedBody(e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-600 border-slate-600 text-white' : 'border-gray-300'}`}
                          rows={6}
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveGeneratedContent}
                          disabled={loading}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
                        >
                          {t('content.saveButton')}
                        </button>
                        <button
                          onClick={() => setIsEditingGenerated(false)}
                          className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition"
                        >
                          {t('content.cancelButton')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={`whitespace-pre-wrap leading-relaxed mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {generatedContent}
                      </div>

                      <button
                        onClick={() => handleCopyToClipboard(generatedContent, -1)}
                        className={`w-full mb-4 font-bold py-2 px-4 rounded-lg transition ${
                          copiedId === -1
                            ? 'bg-green-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {copiedId === -1 ? '✅ ' : '📋 '}{copiedId === -1 ? t('clipboard.copied') : t('clipboard.copy')}
                      </button>
                    </>
                  )}
                </div>
              )}

              <div className={`mt-8 pt-8 border-t-2 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => setShowTemplateForm(!showTemplateForm)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  {showTemplateForm ? '✖ ' : '+ '}{t('templates.createNew')}
                </button>

                {showTemplateForm && (
                  <form onSubmit={handleCreateTemplate} className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                    <div className="mb-4">
                      <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('templates.name')}
                      </label>
                      <input
                        type="text"
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-600 border-slate-600 text-white' : 'border-gray-300'}`}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('templates.category')}
                      </label>
                      <select
                        value={newTemplateCategory}
                        onChange={(e) => setNewTemplateCategory(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-600 border-slate-600 text-white' : 'border-gray-300'}`}
                      >
                        <option value="blog">Blog</option>
                        <option value="email">Email</option>
                        <option value="social">Social Media</option>
                        <option value="product">Product</option>
                        <option value="hr">HR</option>
                        <option value="pr">PR</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('templates.promptText')}
                      </label>
                      <textarea
                        value={newTemplatePrompt}
                        onChange={(e) => setNewTemplatePrompt(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-600 border-slate-600 text-white' : 'border-gray-300'}`}
                        rows={4}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                      {t('templates.save')}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {templates.length > 0 && (
              <div className={`rounded-lg shadow-lg p-6 sticky top-8 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {t('templates.title')}
                </h2>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {defaultTemplates.map((template) => (
                    <div key={template.id} className={`p-3 rounded-lg text-sm ${isDarkMode ? 'bg-slate-700' : 'bg-blue-50'}`}>
                      <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{template.name}</div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{template.category}</div>
                    </div>
                  ))}

                  {customTemplates.map((template) => (
                    <div key={template.id} className={`p-3 rounded-lg text-sm flex justify-between items-start ${isDarkMode ? 'bg-slate-700' : 'bg-green-50'}`}>
                      <div>
                        <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{template.name}</div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{template.category}</div>
                      </div>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={`rounded-lg shadow-lg p-6 sticky top-8 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {t('history.title')}
              </h2>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.length === 0 ? (
                  <p className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {t('history.empty')}
                  </p>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg hover:opacity-80 cursor-pointer transition ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-50 hover:bg-gray-100'}`}
                    >
                      <div
                        onClick={() => handleSelectContent(item.id)}
                        className="mb-2"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`font-semibold truncate flex-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            {item.title}
                          </h4>
                          {item.language && (
                            <span className={`ml-2 px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                              {languages[item.language] || item.language}
                            </span>
                          )}
                        </div>
                        {item.tone && (
                          <div className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            💬 {t(`tones.${item.tone}`)}
                          </div>
                        )}
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.body.substring(0, 50)}...
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyToClipboard(item.body, item.id)}
                          className={`flex-1 text-xs font-bold py-1 px-2 rounded transition ${
                            copiedId === item.id
                              ? 'bg-green-600 text-white'
                              : isDarkMode ? 'bg-slate-600 hover:bg-slate-500 text-gray-300' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                          }`}
                        >
                          {copiedId === item.id ? '✅' : '📋'}
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex-1 text-xs bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded transition"
                        >
                          {t('history.delete')}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {selectedContent && (
          <div className={`mt-8 rounded-lg shadow-lg p-8 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                {isEditingSelected ? (
                  <input
                    type="text"
                    value={editedSelectedTitle}
                    onChange={(e) => setEditedSelectedTitle(e.target.value)}
                    className={`text-2xl font-bold w-full px-2 py-1 border rounded ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'}`}
                  />
                ) : (
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {selectedContent.title}
                  </h2>
                )}
              </div>
              <div className="flex gap-2 ml-4 flex-wrap">
                {selectedContent.language && (
                  <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                    {languages[selectedContent.language] || selectedContent.language}
                  </span>
                )}
                {selectedContent.tone && (
                  <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-800'}`}>
                    💬 {t(`tones.${selectedContent.tone}`)}
                  </span>
                )}
              </div>
            </div>

            {isEditingSelected ? (
              <div>
                <textarea
                  value={editedSelectedBody}
                  onChange={(e) => setEditedSelectedBody(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'}`}
                  rows={10}
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveSelectedContent}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    {t('content.saveButton')}
                  </button>
                  <button
                    onClick={() => setIsEditingSelected(false)}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    {t('content.cancelButton')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className={`whitespace-pre-wrap leading-relaxed mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedContent.body}
                </div>

                <button
                  onClick={() => setShowPreview(true)}
                  className="w-full mb-6 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  👁️ Preview
                </button>

                <button
                  onClick={() => handleCopyToClipboard(selectedContent.body, selectedContent.id)}
                  className={`w-full mb-6 font-bold py-2 px-4 rounded-lg transition ${
                    copiedId === selectedContent.id
                      ? 'bg-green-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {copiedId === selectedContent.id ? '✅ ' : '📋 '}{copiedId === selectedContent.id ? t('clipboard.copied') : t('clipboard.copy')}
                </button>

                <div className={`mb-6 p-4 rounded-lg border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200'}`}>
                  <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    📥 {t('export.title')}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleExport('pdf', selectedContent.id)}
                      disabled={exporting}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-3 rounded-lg transition text-sm"
                    >
                      {exporting ? '⏳' : '📄'} {t('export.exportPDF')}
                    </button>
                    <button
                      onClick={() => handleExport('docx', selectedContent.id)}
                      disabled={exporting}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-3 rounded-lg transition text-sm"
                    >
                      {exporting ? '⏳' : '📝'} {t('export.exportWord')}
                    </button>
                    <button
                      onClick={() => handleExport('markdown', selectedContent.id)}
                      disabled={exporting}
                      className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-bold py-2 px-3 rounded-lg transition text-sm"
                    >
                      {exporting ? '⏳' : '✍️'} {t('export.exportMarkdown')}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleEditSelectedContent}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    ✏️ {t('content.editButton')}
                  </button>
                  <button
                    onClick={() => handleDelete(selectedContent.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    {t('content.deleteButton')}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
                      