import { Package, Camera, QrCode, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">POD App</h1>
              <p className="text-sm text-muted-foreground">Proof of Delivery</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome, Driver</h2>
          <p className="text-muted-foreground">Select an action to continue</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 max-w-2xl mx-auto">
          <Card className="cursor-pointer transition-all hover:shadow-lg border-2 hover:border-primary" onClick={() => navigate("/scan")}>
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary mb-3">
                <QrCode className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>Scan AWB</CardTitle>
              <CardDescription>
                Scan package barcode or QR code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg">
                Start Scanning
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all hover:shadow-lg border-2 hover:border-secondary" onClick={() => navigate("/history")}>
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary mb-3">
                <History className="h-6 w-6 text-secondary-foreground" />
              </div>
              <CardTitle>Delivery History</CardTitle>
              <CardDescription>
                View completed deliveries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full" size="lg">
                View History
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
