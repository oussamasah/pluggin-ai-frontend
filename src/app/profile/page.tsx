import ProfileClient from './ProfileClient'

export const metadata = {
  title: 'Profile | ICP Scout',
  description: 'Manage your account preferences and profile settings.',
}

export default function ProfilePage() {
  return (
    <div className="p-6 md:p-10">
      <ProfileClient />
    </div>
  )
}
