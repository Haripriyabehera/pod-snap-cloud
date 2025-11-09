import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Package, Calendar, FileText, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

interface Delivery {
  id: string;
  awb_number: string;
  media_url: string;
  media_type: string;
  delivered_at: string;
  driver_notes: string | null;
}

const History = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .order('delivered_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setDeliveries(data || []);
    } catch (error) {
      console.error("Error loading deliveries:", error);
      toast.error("Failed to load delivery history");
    } finally {
      setLoading(false);
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Delivery History</h1>
          <p className="text-muted-foreground">View all completed deliveries</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading deliveries...</p>
          </div>
        ) : deliveries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No deliveries recorded yet</p>
              <Button onClick={() => navigate("/scan")}>
                Scan First Package
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <Card key={delivery.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        AWB: {delivery.awb_number}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(delivery.delivered_at), "PPp")}
                      </CardDescription>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-success text-success-foreground">
                      {delivery.media_type}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Media Preview */}
                  <div className="rounded-lg overflow-hidden bg-muted">
                    {delivery.media_type === 'video' ? (
                      <video 
                        src={delivery.media_url} 
                        controls 
                        className="w-full max-h-64 object-contain"
                      />
                    ) : (
                      <img 
                        src={delivery.media_url} 
                        alt={`Delivery ${delivery.awb_number}`}
                        className="w-full max-h-64 object-contain"
                      />
                    )}
                  </div>

                  {/* Notes */}
                  {delivery.driver_notes && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="h-4 w-4" />
                        Notes
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
                        {delivery.driver_notes}
                      </p>
                    </div>
                  )}

                  {/* View Media Link */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2"
                    onClick={() => window.open(delivery.media_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Full Media
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
