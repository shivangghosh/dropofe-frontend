import { Metadata } from 'next';
import { auth } from '@clerk/nextjs';
import { getUserById } from '@/lib/services/user.service';
import ProfileForm from '@/components/forms/profile-form';

export const metadata: Metadata = {
  title: 'Dropofe| Profile Edit',
  description: 'Edit your profile on Dev Overflow',
};

export default async function EditProfilePage() {
  const { userId } = auth();
  const mongoUser = await getUserById(userId!);
  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Profile</h1>
      <div className="mt-9">
        <ProfileForm clerkId={userId!} user={JSON.stringify(mongoUser)} />
      </div>
    </>
  );
}
