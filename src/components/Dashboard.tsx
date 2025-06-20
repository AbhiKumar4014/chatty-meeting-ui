
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Mic, FileText, Search, Moon, Sun } from 'lucide-react';
import Transcriber from './features/Transcriber';
import Summarizer from './features/Summarizer';
import Recollector from './features/Recollector';
import { toast } from '@/hooks/use-toast';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('transcribe');

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50'}`}>
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-purple-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Meeting Assistant
              </h1>
              <span className="hidden sm:block text-gray-600 dark:text-gray-300">
                Welcome, {user?.name}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Your AI Meeting Assistant
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Transcribe, summarize, and search through your meetings with ease
          </p>
        </div>

        {/* Mobile-friendly tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none lg:flex mb-8">
            <TabsTrigger 
              value="transcribe" 
              className="flex items-center space-x-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Mic className="h-4 w-4" />
              <span className="hidden sm:inline">Transcribe</span>
            </TabsTrigger>
            <TabsTrigger 
              value="summarize"
              className="flex items-center space-x-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Summarize</span>
            </TabsTrigger>
            <TabsTrigger 
              value="recollect"
              className="flex items-center space-x-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transcribe" className="mt-0">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-purple-200 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-700 dark:text-purple-300">
                  <Mic className="h-5 w-5" />
                  <span>Audio Transcription</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Transcriber />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summarize" className="mt-0">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-purple-200 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-700 dark:text-purple-300">
                  <FileText className="h-5 w-5" />
                  <span>Text Summarization</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Summarizer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recollect" className="mt-0">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-purple-200 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-700 dark:text-purple-300">
                  <Search className="h-5 w-5" />
                  <span>Search Summaries</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Recollector />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
