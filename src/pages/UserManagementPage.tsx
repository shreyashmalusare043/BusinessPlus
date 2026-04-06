import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getAllProfiles, updateUserRole } from '@/db/api';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Shield, User, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/db/supabase';
import type { Profile } from '@/types';

export default function UserManagementPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadUsers();
  }, [profile, navigate]);

  const loadUsers = async () => {
    try {
      const data = await getAllProfiles();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    if (userId === profile?.id) {
      toast.error('You cannot change your own role');
      return;
    }

    try {
      await updateUserRole(userId, newRole);
      toast.success('User role updated successfully');
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (userId === profile?.id) {
      toast.error('You cannot delete your own account');
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${username}"?\n\nThis will permanently delete:\n- User account\n- All their bills and purchase orders\n- All their stock records\n- All their work logs\n- Company settings\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      // Delete user from profiles (cascade will handle related data)
      const { error } = await supabase.from('profiles').delete().eq('id', userId);

      if (error) throw error;

      toast.success(`User "${username}" deleted successfully`);
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48 bg-muted" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          As an admin, you can view and manage user accounts. Note: You can only see user profile information, not their business data (bills, purchase orders, stock, etc.).
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
          <CardDescription>
            Manage user roles and accounts. First registered user is automatically assigned as admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: Profile) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {user.role === 'admin' ? (
                        <Shield className="h-4 w-4 text-primary" />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground" />
                      )}
                      {user.username}
                      {user.id === profile?.id && (
                        <Badge variant="outline" className="ml-2">You</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{user.email || '-'}</TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {user.id === profile?.id ? (
                        <span className="text-sm text-muted-foreground">Current User</span>
                      ) : (
                        <>
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleRoleChange(user.id, value as 'user' | 'admin')}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• The first user to register automatically becomes an admin</p>
          <p>• Admins can view and manage all user accounts</p>
          <p>• Admins can delete users (this will permanently delete all their data)</p>
          <p>• Admins CANNOT access other users' business data (bills, POs, stock, etc.)</p>
          <p>• You cannot change your own role or delete your own account</p>
          <p>• All business data is isolated - users can only see their own records</p>
        </CardContent>
      </Card>
    </div>
  );
}
