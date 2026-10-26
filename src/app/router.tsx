import { Navigate, Route, Routes } from 'react-router'
import { OrdersListPage } from '../features/orders/pages/OrdersListPage'
import { AppLayout } from './layout/AppLayout'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="orders" element={<OrdersListPage />} />
        <Route path="*" element={<Navigate to="/orders" replace />} />
      </Route>
    </Routes>
  )
}
