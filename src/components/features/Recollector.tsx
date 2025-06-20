
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Tag, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';

interface SearchResult {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  tags: string[];
  score: number;
}

const Recollector: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const { token } = useAuth();

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Empty search",
        description: "Please enter a search query",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await mockSearchAPI(query.trim(), token);
      setResults(response.results);
      
      toast({
        title: "Search completed",
        description: `Found ${response.results.length} matching summaries`,
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Please try again or check your internet connection",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-700">
        <h3 className="text-lg font-semibold mb-4 text-indigo-700 dark:text-indigo-300 flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Search Your Summaries
        </h3>
        
        <div className="flex space-x-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for topics, keywords, or phrases..."
            className="flex-1 text-base"
          />
          <Button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 px-6"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Quick searches:</span>
          {['meeting notes', 'action items', 'decisions', 'client feedback'].map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => setQuery(suggestion)}
              className="text-xs"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </Card>

      {/* Results Section */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Search Results
            </h3>
            {results.length > 0 && (
              <span className="text-sm text-gray-500">
                {results.length} result(s) found
              </span>
            )}
          </div>

          {results.length === 0 && !isLoading ? (
            <Card className="p-8 text-center">
              <Search className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                No results found
              </h4>
              <p className="text-gray-500 dark:text-gray-500">
                Try different keywords or check your spelling
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {results.map((result) => (
                <Card
                  key={result.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        {result.title}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(result.createdAt)}
                        </span>
                        <span className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${getScoreColor(result.score)}`}></div>
                          {Math.round(result.score * 100)}% match
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    {result.summary}
                  </p>

                  {result.tags.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <div className="flex flex-wrap gap-2">
                        {result.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tips Section */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700">
        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">🔍 Search Tips:</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>• Use specific keywords related to your meetings</li>
          <li>• Try different variations of the same concept</li>
          <li>• Search for participant names, company names, or project names</li>
          <li>• Use quotes for exact phrase matching</li>
        </ul>
      </Card>
    </div>
  );
};

// Mock API function - replace with actual API call
const mockSearchAPI = async (query: string, token: string | null) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'Q3 Sales Review Meeting',
      summary: 'Discussed quarterly sales performance, identified key growth opportunities in the enterprise segment, and reviewed pipeline for Q4. Action items include following up with three major prospects and adjusting pricing strategy.',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      tags: ['sales', 'quarterly review', 'pipeline'],
      score: 0.92
    },
    {
      id: '2',
      title: 'Product Roadmap Planning',
      summary: 'Strategic planning session for next year\'s product development. Prioritized features based on customer feedback and market research. Decided to focus on mobile app improvements and AI integration.',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      tags: ['product', 'roadmap', 'planning', 'AI'],
      score: 0.78
    },
    {
      id: '3',
      title: 'Client Feedback Session',
      summary: 'Valuable feedback from key clients about our platform. Several suggestions for UI improvements and new feature requests. Overall satisfaction is high, but there are opportunities for enhancement.',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      tags: ['client feedback', 'UI', 'features'],
      score: 0.65
    }
  ];

  // Filter results based on query (simple mock implementation)
  const filtered = mockResults.filter(result => 
    result.title.toLowerCase().includes(query.toLowerCase()) ||
    result.summary.toLowerCase().includes(query.toLowerCase()) ||
    result.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );

  return {
    results: filtered,
    total: filtered.length
  };
};

export default Recollector;
