import { Redirect } from 'expo-router';

export default function Index() {
  // In a real app, you would check for a stored token or auth state here.
  // For now, we redirect to login to show the new design.
  return <Redirect href="/login" />;
}
