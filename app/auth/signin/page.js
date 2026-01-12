import { Suspense } from 'react';
import SigninClient from './SigninClient';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SigninClient />
    </Suspense>
  );
}
