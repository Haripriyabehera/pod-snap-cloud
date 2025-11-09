import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Camera, ScanLine } from "lucide-react";
import { toast } from "sonner";

const Scanner = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [manualAwb, setManualAwb] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    return () => {
      if (scannerRef.current && scanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [scanning]);

  const startScanning = async () => {
    try {
      setCameraError(false);
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Ignore scan errors (they happen continuously while scanning)
        }
      );
      setScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      setCameraError(true);
      toast.error("Unable to access camera. Please enter AWB manually or check permissions.");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop();
        setScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const handleScanSuccess = (awbNumber: string) => {
    stopScanning();
    toast.success("AWB scanned successfully!");
    navigate(`/capture?awb=${encodeURIComponent(awbNumber)}`);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualAwb.trim()) {
      navigate(`/capture?awb=${encodeURIComponent(manualAwb.trim())}`);
    } else {
      toast.error("Please enter a valid AWB number");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Scan AWB Number</h1>
          <p className="text-muted-foreground">Scan the barcode or QR code on the package</p>
        </div>

        {/* Scanner Area */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanLine className="h-5 w-5" />
              Camera Scanner
            </CardTitle>
            <CardDescription>Point your camera at the barcode or QR code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!scanning && !cameraError && (
                <div className="flex items-center justify-center bg-muted rounded-lg p-12">
                  <Button onClick={startScanning} size="lg" className="gap-2">
                    <Camera className="h-5 w-5" />
                    Start Camera
                  </Button>
                </div>
              )}

              {cameraError && (
                <div className="flex flex-col items-center justify-center bg-muted rounded-lg p-12 text-center">
                  <p className="text-muted-foreground mb-4">Camera access denied or unavailable</p>
                  <Button onClick={startScanning} variant="outline" className="gap-2">
                    <Camera className="h-5 w-5" />
                    Try Again
                  </Button>
                </div>
              )}

              {scanning && (
                <>
                  <div id="reader" className="w-full rounded-lg overflow-hidden"></div>
                  <Button onClick={stopScanning} variant="destructive" className="w-full">
                    Stop Scanning
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Manual Entry */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Entry</CardTitle>
            <CardDescription>Or enter the AWB number manually</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="awb">AWB Number</Label>
                <Input
                  id="awb"
                  type="text"
                  placeholder="Enter AWB number"
                  value={manualAwb}
                  onChange={(e) => setManualAwb(e.target.value)}
                  className="text-lg"
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Scanner;
