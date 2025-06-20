
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FileText, Send, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';

interface Summary {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const Summarizer: React.FC = () => {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { token } = useAuth();

  const generateTitle = () => {
    if (text.trim()) {
      const words = text.trim().split(' ').slice(0, 5);
      const autoTitle = words.join(' ') + (text.split(' ').length > 5 ? '...' : '');
      setTitle(autoTitle);
      
      toast({
        title: "Title generated",
        description: "Auto-generated title from your text",
      });
    } else {
      toast({
        title: "No text found",
        description: "Please enter some text first",
        variant: "destructive"
      });
    }
  };

  const handleSummarize = async () => {
    if (!text.trim()) {
      toast({
        title: "No text to summarize",
        description: "Please enter some text to summarize",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await mockSummarizeAPI({
        text: text.trim(),
        title: title.trim() || undefined
      }, token);

      setSummary(response);
      
      toast({
        title: "Summary created",
        description: "Your text has been successfully summarized",
      });
    } catch (error) {
      toast({
        title: "Summarization failed",
        description: "Please try again or check your internet connection",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setTitle('');
    setSummary(null);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700">
          <h3 className="text-lg font-semibold mb-4 text-purple-700 dark:text-purple-300 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Text Input
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">
                Title (Optional)
              </Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title or auto-generate..."
                  className="flex-1"
                />
                <Button
                  onClick={generateTitle}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="text" className="text-sm font-medium">
                Text to Summarize
              </Label>
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your meeting transcript or any text you want to summarize..."
                className="min-h-[300px] mt-1 text-base leading-relaxed"
              />
              <p className="text-xs text-gray-500 mt-2">
                {text.length} characters
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleSummarize}
                disabled={isLoading || !text.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Summarizing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Summarize
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleClear}
                variant="outline"
                disabled={isLoading}
              >
                Clear
              </Button>
            </div>
          </div>
        </Card>

        {/* Summary Output */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
          <h3 className="text-lg font-semibold mb-4 text-blue-700 dark:text-blue-300 flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            Summary
          </h3>
          
          {summary ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                  {summary.title}
                </h4>
                <p className="text-sm text-gray-500">
                  Created on {new Date(summary.createdAt).toLocaleString()}
                </p>
              </div>
              
              <div className="prose dark:prose-invert max-w-none">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    {summary.content}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  Save Summary
                </Button>
                <Button size="sm" variant="outline">
                  Share
                </Button>
                <Button size="sm" variant="outline">
                  Export
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-blue-300 dark:text-blue-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Your summary will appear here after processing
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Tips Section */}
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700">
        <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">💡 Tips for better summaries:</h4>
        <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
          <li>• Provide clear, well-structured text for more accurate summaries</li>
          <li>• Add a descriptive title to help organize your summaries</li>
          <li>• Longer texts typically produce more detailed summaries</li>
          <li>• Review and edit the summary if needed before saving</li>
        </ul>
      </Card>
    </div>
  );
};

// Mock API function - replace with actual API call
const mockSummarizeAPI = async (data: { text: string; title?: string }, token: string | null) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    id: 'summary-' + Date.now(),
    title: data.title || 'Meeting Summary',
    content: 'This is a sample summary of your text. In a real implementation, this would be an AI-generated summary that captures the key points, main topics, and important decisions from your meeting transcript or text input. The summary would be concise yet comprehensive, highlighting the most relevant information.',
    createdAt: new Date().toISOString()
  };
};

export default Summarizer;
