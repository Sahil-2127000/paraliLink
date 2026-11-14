import { RoleShell } from '../../components/layout/RoleShell'
import { TABS } from './copy'

/** Farmer app: phone tabs / desktop sidebar (see RoleShell). */
export default function FarmerLayout() {
  return <RoleShell roleLabel="Farmer" homeTo="/farmer" tabs={TABS} />
}
