import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAllSubscriptions, getAllTransactions } from '@/db/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { SubscriptionWithUser, TransactionWithUser } from '@/types';
import { DollarSign, Users, TrendingUp, CreditCard } from 'lucide-react';

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithUser[]>([]);
  const [transactions, setTransactions] = useState<TransactionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [profile]);

  const loadData = async () => {
    try {
      const [subsData, txData] = await Promise.all([
        getAllSubscriptions(),
        getAllTransactions(),
      ]);
      setSubscriptions(subsData);
      setTransactions(txData);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const activeSubscriptions = subscriptions.filter((s) => s.status === 'active');
  const totalRevenue = transactions
    .filter((t) => t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyRevenue = transactions
    .filter((t) => {
      const txDate = new Date(t.created_at);
      const now = new Date();
      return (
        t.status === 'success' &&
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground mt-1">Monitor user subscriptions and transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
            <p className="text-xs text-muted-foreground">
              {subscriptions.length} total subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter((t) => t.status === 'success').length} successful
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Subscriptions and Transactions */}
      <Tabs defaultValue="subscriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Subscriptions</CardTitle>
              <CardDescription>View and manage user subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No subscriptions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.user.username}</TableCell>
                        <TableCell>{sub.user.email}</TableCell>
                        <TableCell>
                          <Badge variant={sub.plan_type === 'yearly' ? 'default' : 'secondary'}>
                            {sub.plan_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              sub.status === 'active'
                                ? 'default'
                                : sub.status === 'expired'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(sub.start_date).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(sub.end_date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>View payment history and transaction details</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-sm">{tx.transaction_id}</TableCell>
                        <TableCell>{tx.user.username}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{tx.plan_type}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">₹{tx.amount}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              tx.status === 'success'
                                ? 'default'
                                : tx.status === 'failed'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
