import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getMyChallans, deleteChallan, checkSubscriptionStatus } from '@/db/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Eye, Trash2, Lock, Crown } from 'lucide-react';
import { toast } from 'sonner';
import type { DeliveryChallan } from '@/types';

const purposeLabels: Record<string, string> = {
  job_work: 'Job Work',
  return_after_job_work: 'Return after Job Work',
  repair: 'For Repair',
  sample: 'For Sample',
  branch_transfer: 'Branch Transfer',
};

export default function ChallanListPage() {
  const [challans, setChallans] = useState<DeliveryChallan[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPremium, setHasPremium] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadChallans();
    checkPremium();
  }, []);

  const checkPremium = async () => {
    try {
      const premium = await checkSubscriptionStatus();
      setHasPremium(premium);
    } catch (error) {
      console.error('Failed to check subscription:', error);
    }
  };

  const loadChallans = async () => {
    try {
      const data = await getMyChallans();
      setChallans(data);
    } catch (error) {
      console.error('Failed to load delivery challans:', error);
      toast.error('Failed to load delivery challans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    if (!hasPremium) {
      toast.error('Delivery Challan is a premium feature. Please upgrade to access.');
      navigate('/subscription');
      return;
    }
    navigate('/delivery-challans/create');
  };

  const handleDelete = async (challanId: string) => {
    if (!confirm('Are you sure you want to delete this delivery challan?')) return;

    try {
      await deleteChallan(challanId);
      toast.success('Delivery challan deleted successfully');
      loadChallans();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete delivery challan');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-64 bg-muted" />
          <Skeleton className="h-10 w-48 bg-muted" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!hasPremium && (
        <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950">
          <Crown className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-900 dark:text-orange-100">Premium Feature</AlertTitle>
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            Delivery Challan is available only for paid subscribers. 
            <Button 
              variant="link" 
              className="p-0 h-auto ml-1 text-orange-600 hover:text-orange-700"
              onClick={() => navigate('/subscription')}
            >
              Upgrade now
            </Button> to unlock this feature.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Delivery Challans</h1>
        <Button onClick={handleCreateClick} disabled={!hasPremium}>
          {!hasPremium && <Lock className="mr-2 h-4 w-4" />}
          {hasPremium && <Plus className="mr-2 h-4 w-4" />}
          Create Delivery Challan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Delivery Challans</CardTitle>
        </CardHeader>
        <CardContent>
          {challans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No delivery challans created yet</p>
              <Button onClick={handleCreateClick} disabled={!hasPremium}>
                {!hasPremium && <Lock className="mr-2 h-4 w-4" />}
                {hasPremium && <Plus className="mr-2 h-4 w-4" />}
                Create Your First Delivery Challan
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Challan No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Party Name</TableHead>
                  <TableHead>Place of Supply</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {challans.map((challan) => (
                  <TableRow key={challan.id}>
                    <TableCell className="font-medium">{challan.challan_no}</TableCell>
                    <TableCell>{new Date(challan.challan_date).toLocaleDateString()}</TableCell>
                    <TableCell>{challan.party_name}</TableCell>
                    <TableCell>{challan.place_of_supply}</TableCell>
                    <TableCell>{purposeLabels[challan.purpose]}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/delivery-challans/${challan.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(challan.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
