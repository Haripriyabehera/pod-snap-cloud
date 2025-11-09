import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Home, Package } from "lucide-react";

const Success = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success">
              <CheckCircle className="h-12 w-12 text-success-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Delivery Recorded!</h1>
            <p className="text-muted-foreground">
              Your proof of delivery has been successfully uploaded and saved.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={() => navigate("/scan")} size="lg" className="gap-2">
              <Package className="h-5 w-5" />
              Scan Next Package
            </Button>
            <Button onClick={() => navigate("/")} variant="outline" size="lg" className="gap-2">
              <Home className="h-5 w-5" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Success;
