import { useAppSelector } from '@/app/hooks'
import AdminOverviewPage from '@/pages/admin/overview'
import DoctorOverviewPage from '@/pages/doctors/overview'

export default function RoleIndexPage() {
  const role = useAppSelector((state) => state.auth.role)

  if (role === 'admin') {
    return <AdminOverviewPage />
  }

  return <DoctorOverviewPage />
}
