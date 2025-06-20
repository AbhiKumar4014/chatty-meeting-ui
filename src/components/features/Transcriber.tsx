
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Upload, Mic, Square, Play, Pause } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';

const Transcriber: React.FC = () => {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const { token } = useAuth();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording started",
        description: "Speak clearly for better transcription quality",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      toast({
        title: "Recording stopped",
        description: "Click 'Transcribe Recording' to process the audio",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav')) {
        setAudioBlob(file);
        toast({
          title: "File uploaded",
          description: `${file.name} ready for transcription`,
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an audio file (MP3, WAV)",
          variant: "destructive"
        });
      }
    }
  };

  const transcribeAudio = async (audioFile: Blob) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('audio', audioFile, 'audio.wav');

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Mock API call - replace with actual endpoint
      const response = await mockTranscribeAPI(formData, token);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTranscript(response.transcript);
      
      toast({
        title: "Transcription complete",
        description: "Your audio has been successfully transcribed",
      });
    } catch (error) {
      toast({
        title: "Transcription failed",
        description: "Please try again or check your internet connection",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
          <h3 className="text-lg font-semibold mb-4 text-purple-700 dark:text-purple-300">Record Audio</h3>
          
          <div className="text-center space-y-4">
            {isRecording && (
              <div className="text-2xl font-mono text-red-600 dark:text-red-400">
                {formatTime(recordingTime)}
              </div>
            )}
            
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-full py-6 text-lg font-semibold transition-all duration-200 ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="h-6 w-6 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-6 w-6 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
            
            {audioBlob && !isRecording && (
              <Button
                onClick={() => transcribeAudio(audioBlob)}
                disabled={isUploading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Transcribe Recording
              </Button>
            )}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
          <h3 className="text-lg font-semibold mb-4 text-blue-700 dark:text-blue-300">Upload Audio File</h3>
          
          <div className="text-center space-y-4">
            <div className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg p-8 hover:border-blue-400 transition-colors">
              <Upload className="h-12 w-12 mx-auto text-blue-400 mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Drop audio files here or click to browse
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400"
              >
                Choose File
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.mp3,.wav"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            {audioBlob && (
              <Button
                onClick={() => transcribeAudio(audioBlob)}
                disabled={isUploading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Transcribe File
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Transcribing audio...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        </Card>
      )}

      {/* Transcript Output */}
      {transcript && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Transcript</h3>
          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your transcript will appear here..."
            className="min-h-[200px] text-base leading-relaxed"
          />
          <p className="text-sm text-gray-500 mt-2">
            You can edit the transcript above before proceeding to summarization.
          </p>
        </Card>
      )}
    </div>
  );
};

// Mock API function - replace with actual API call
const mockTranscribeAPI = async (formData: FormData, token: string | null) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    transcript: "This is a sample transcript of your audio. In a real implementation, this would be the actual transcribed text from your audio file using speech-to-text technology. The transcript would include all the spoken words from your meeting or audio recording."
  };
};

export default Transcriber;
