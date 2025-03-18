import { useState, useRef, useEffect } from 'react';

type DocumentType = 'aadhaar' | 'pan' | null;

interface DocumentScannerProps {
  onCapture: (type: DocumentType, number: string, image: string) => void;
  capturedDocuments: {
    aadhaar: boolean;
    pan: boolean;
  };
}

const DocumentScanner: React.FC<DocumentScannerProps> = ({ onCapture, capturedDocuments }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentType>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [documentNumber, setDocumentNumber] = useState('');
  const [processingText, setProcessingText] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Simulated document numbers
  const simulatedNumbers = {
    aadhaar: '1234 5678 9012',
    pan: 'ABCDE1234F'
  };

  useEffect(() => {
    return () => {
      // Clean up video stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startScanning = async (type: DocumentType) => {
    try {
      setDocumentType(type);
      setIsScanning(true);
      setCapturedImage(null);
      setDocumentNumber('');
      setProcessingText('');

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access the camera. Please make sure you have given permission to use the camera.');
      setIsScanning(false);
    }
  };

  const captureDocument = () => {
    if (!documentType || !videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current frame of the video on the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to image data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageDataUrl);
    
    // Stop the camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setIsScanning(false);
    
    // Simulate processing
    simulateDocumentProcessing(documentType, imageDataUrl);
  };

  const simulateDocumentProcessing = (type: DocumentType, image: string) => {
    if (!type) return;
    
    setProcessingText('Processing document...');
    
    // Simulate processing delay
    setTimeout(() => {
      setProcessingText('Extracting information...');
      
      // Simulate another delay for OCR
      setTimeout(() => {
        setProcessingText('Verification complete!');
        
        // Set the simulated document number based on type
        const number = simulatedNumbers[type];
        setDocumentNumber(number);
        
        // Call the onCapture callback
        onCapture(type, number, image);
        
      }, 1000);
    }, 1500);
  };

  const resetScanner = () => {
    setIsScanning(false);
    setDocumentType(null);
    setCapturedImage(null);
    setDocumentNumber('');
    setProcessingText('');
    
    // Stop the camera stream if it's still active
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocumentNumber(e.target.value);
  };

  const submitManualInput = () => {
    if (!documentType || !documentNumber) return;
    onCapture(documentType, documentNumber, '');
    resetScanner();
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h3 className="text-xl font-semibold text-secondary-900 mb-4">Document Verification</h3>
      
      {/* Document selection buttons */}
      {!isScanning && !capturedImage && !documentType && (
        <div>
          <p className="text-secondary-700 mb-4">
            Please select the document you would like to scan:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => startScanning('aadhaar')}
              disabled={capturedDocuments.aadhaar}
              className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all ${
                capturedDocuments.aadhaar 
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed' 
                  : 'hover:border-primary-300 hover:bg-primary-50 border-gray-200'
              }`}
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-2">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <span className={`font-medium ${capturedDocuments.aadhaar ? 'text-gray-500' : 'text-secondary-900'}`}>
                Aadhaar Card
              </span>
              {capturedDocuments.aadhaar && (
                <span className="mt-2 inline-flex items-center text-sm text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
            </button>
            
            <button
              onClick={() => startScanning('pan')}
              disabled={capturedDocuments.pan}
              className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all ${
                capturedDocuments.pan 
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed' 
                  : 'hover:border-primary-300 hover:bg-primary-50 border-gray-200'
              }`}
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-2">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className={`font-medium ${capturedDocuments.pan ? 'text-gray-500' : 'text-secondary-900'}`}>
                PAN Card
              </span>
              {capturedDocuments.pan && (
                <span className="mt-2 inline-flex items-center text-sm text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Camera view for scanning */}
      {isScanning && (
        <div className="mb-4">
          <p className="text-secondary-700 mb-4">
            Position your {documentType === 'aadhaar' ? 'Aadhaar Card' : 'PAN Card'} within the frame and ensure it's clearly visible.
          </p>
          
          <div className="relative rounded-lg overflow-hidden border-2 border-primary-300 mb-4 aspect-w-4 aspect-h-3">
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover" 
              autoPlay 
              playsInline
            />
            
            {/* Scan overlay with camera frame */}
            <div className="absolute inset-0 border-[3rem] sm:border-[5rem] border-black/50">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-500"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-500"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-500"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-500"></div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={resetScanner}
              className="px-4 py-2 border border-gray-300 rounded-lg text-secondary-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={captureDocument}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Capture
            </button>
          </div>
          
          {/* Hidden canvas for processing captured images */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
      
      {/* Show captured document */}
      {capturedImage && (
        <div className="mb-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-secondary-900">
                {documentType === 'aadhaar' ? 'Aadhaar Card' : 'PAN Card'}
              </h4>
              {processingText && (
                <span className="text-sm text-primary-600 animate-pulse">
                  {processingText}
                </span>
              )}
            </div>
            
            <div className="rounded-lg overflow-hidden border border-gray-300 mb-4">
              <img 
                src={capturedImage} 
                alt={`Captured ${documentType}`} 
                className="w-full h-auto"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                {documentType === 'aadhaar' ? 'Aadhaar Number' : 'PAN Number'}
              </label>
              <input
                type="text"
                value={documentNumber}
                onChange={handleManualInput}
                placeholder={documentType === 'aadhaar' ? 'XXXX XXXX XXXX' : 'ABCDE1234F'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                {documentNumber ? 'Number extracted from document' : 'If number is not auto-filled, please enter manually'}
              </p>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={resetScanner}
                className="px-4 py-2 border border-gray-300 rounded-lg text-secondary-700 hover:bg-gray-50 transition"
              >
                Try Again
              </button>
              <button
                onClick={submitManualInput}
                disabled={!documentNumber}
                className={`px-4 py-2 rounded-lg transition ${
                  documentNumber 
                    ? 'bg-primary-500 text-white hover:bg-primary-600' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentScanner; 