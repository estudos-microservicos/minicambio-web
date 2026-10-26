import { Navigate, Route, Routes } from 'react-router'
import { CreateOrderPage } from '../features/orders/pages/CreateOrderPage'
import { OrderDetailsPage } from '../features/orders/pages/OrderDetailsPage'
import { OrdersListPage } from '../features/orders/pages/OrdersListPage'
import { AppLayout } from './layout/AppLayout'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="orders" element={<OrdersListPage />} />
        <Route path="orders/new" element={<CreateOrderPage />} />
        <Route path="orders/:id" element={<OrderDetailsPage />} />
        <Route path="*" element={<Navigate to="/orders" replace />} />
      </Route>
    </Routes>
  )
}
