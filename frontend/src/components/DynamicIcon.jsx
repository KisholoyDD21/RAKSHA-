import {
  Waves, Flame, Car, Construction, Mountain, CloudLightning, Activity,
  Building2, ZapOff, Biohazard, CircleAlert, Tent, Cross, ShieldCheck,
  Siren, Home, PackageSearch,
} from 'lucide-react';

// Explicit registry (not `import * as` from lucide-react) so the bundler
// only includes the ~17 icons RAKSHA actually references, instead of the
// entire icon library — meaningful savings for a low-connectivity
// disaster app where every kilobyte affects load time.
const REGISTRY = {
  Waves, Flame, Car, Construction, Mountain, CloudLightning, Activity,
  Building2, ZapOff, Biohazard, CircleAlert, Tent, Cross, ShieldCheck,
  Siren, Home, PackageSearch,
};

export function DynamicIcon({ name, ...props }) {
  const Icon = REGISTRY[name] || CircleAlert;
  return <Icon {...props} />;
}
