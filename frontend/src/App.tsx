import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface Content {
  id: number;
  title: string;
  body: string;
  owner_id?: number;
}

function App() {
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [history, setHistory] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8118';

  // Fetch history on component mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history`);
      setHistory(response.data);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load history');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedContent('');

    try {
      const response = await axios.post(`${API_BASE_URL}/generate`, null, {
        params: { prompt }
      });
      
      setGeneratedContent(response.data.content);
      setPrompt('');
      
      // Refresh history
      fetchHistory();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error generating content');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contentId: number) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/content/${contentId}`);
      fetchHistory();
      if (selectedContent?.id === contentId) {
        setSelectedContent(null);
      }
      setError('');
    } catch (err) {
      setError('Failed to delete content');
      console.error('Error:', err);
    }
  };

  const handleSelectContent = async (contentId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/content/${contentId}`);
      setSelectedContent(response.data);
    } catch (err) {
      setError('Failed to load content');
      console.error('Error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            Easy Content Generator
          </h1>
          <p className="text-xl text-gray-600">
            Generate amazing content with AI powered by Gemini
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Generate Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Generate Content
              </h2>

              {/* Form */}
              <form onSubmit={handleGenerate} className="mb-6">
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Enter Your Prompt
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Write a blog post about... or Generate a story about..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                >
                  {loading ? 'Generating...' : 'Generate Content'}
                </button>
              </form>

              {/* Generated Content Display */}
              {generatedContent && (
                <div className="mt-8 p-6 bg-gray-50 rounded-lg border-2 border-green-500">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Generated Content
                  </h3>
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {generatedContent}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - History */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                History
              </h2>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No content generated yet
                  </p>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                    >
                      <div
                        onClick={() => handleSelectContent(item.id)}
                        className="mb-2"
                      >
                        <h4 className="font-semibold text-gray-800 truncate">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {item.body.substring(0, 50)}...
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="w-full text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded transition"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Content Details */}
        {selectedContent && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {selectedContent.title}
            </h2>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">
              {selectedContent.body}
            </div>
            <button
              onClick={() => handleDelete(selectedContent.id)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Delete This Content
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;