import { Link, NavLink, Outlet } from 'react-router'
import styles from './AppLayout.module.css'

export function AppLayout() {
  return (
    <>
      <a href="#conteudo" className={styles.skipLink}>
        Pular para o conteúdo
      </a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/orders" className={styles.brand}>
            MiniCâmbio
          </Link>
          <nav aria-label="Principal">
            <ul className={styles.navList}>
              <li>
                {/* NavLink marca o item ativo com aria-current="page", que também é usado no CSS. */}
                <NavLink to="/orders" end className={styles.navLink}>
                  Ordens
                </NavLink>
              </li>
              <li>
                <NavLink to="/orders/new" className={styles.navLink}>
                  Nova ordem
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main id="conteudo" tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>
    </>
  )
}
