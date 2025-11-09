import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Camera, CheckCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Capture = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const awbNumber = searchParams.get("awb") || "";
  
  const [capturedMedia, setCapturedMedia] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCapturedMedia(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      toast.success("Photo captured!");
    }
  };

  const handleUpload = async () => {
    if (!capturedMedia || !awbNumber) {
      toast.error("Missing required data");
      return;
    }

    setUploading(true);
    try {
      // Upload to storage
      const fileExt = capturedMedia.name.split('.').pop();
      const fileName = `${awbNumber}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('pod-media')
        .upload(filePath, capturedMedia);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pod-media')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('deliveries')
        .insert({
          awb_number: awbNumber,
          media_url: publicUrl,
          media_type: capturedMedia.type.startsWith('video/') ? 'video' : 'photo',
          driver_notes: notes || null,
        });

      if (dbError) throw dbError;

      toast.success("Delivery recorded successfully!");
      navigate("/success");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/scan")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Proof of Delivery</h1>
          <p className="text-muted-foreground">AWB: <span className="font-mono font-bold text-foreground">{awbNumber}</span></p>
        </div>

        <div className="space-y-6">
          {/* Camera Capture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Capture Photo
              </CardTitle>
              <CardDescription>Take a photo of the delivered package</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!previewUrl ? (
                <div className="flex flex-col items-center justify-center bg-muted rounded-lg p-12">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    capture="environment"
                    onChange={handleCapture}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    size="lg"
                    className="gap-2"
                  >
                    <Camera className="h-5 w-5" />
                    Take Photo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden bg-black">
                    {capturedMedia?.type.startsWith('video/') ? (
                      <video src={previewUrl} controls className="w-full" />
                    ) : (
                      <img src={previewUrl} alt="Captured delivery" className="w-full" />
                    )}
                  </div>
                  <Button
                    onClick={() => {
                      setCapturedMedia(null);
                      setPreviewUrl("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Retake Photo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Notes</CardTitle>
              <CardDescription>Optional additional information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="e.g., Left at front door, signed by John Doe..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            onClick={handleUpload}
            disabled={!capturedMedia || uploading}
            size="lg"
            className="w-full gap-2"
          >
            {uploading ? (
              <>
                <Upload className="h-5 w-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Complete Delivery
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Capture;
