import type { V2_MetaFunction } from '@remix-run/node';
import { Title, BodyLarge } from '@sumup/circuit-ui';

import { DocCard } from '../../components/DocCard';

import styles from './route.module.css';

const title = 'Welcome to Circuit UI + Remix';

export const meta: V2_MetaFunction = () => [
  { title },
  {
    name: 'description',
    content: 'A Remix stack using Circuit UI and Foundry',
  },
];

export default function Index() {
  return (
    <>
      <Title as="h1" size="three">
        {title}
      </Title>

      <BodyLarge className={styles.intro}>
        Get started by editing <code>app/routes/_index/route.tsx</code>
      </BodyLarge>

      <div className={styles.cards}>
        <DocCard
          title="Remix"
          description="Find in-depth information about Remix features and API."
          href="https://remix.run/docs"
        />

        <DocCard
          title="Circuit UI"
          description="Discover SumUp's design system for the web."
          href="https://circuit.sumup.com"
        />

        <DocCard
          title="Foundry"
          description="Learn about SumUp's toolkit for building TypeScript applications."
          href="https://github.com/sumup-oss/foundry"
        />
      </div>
    </>
  );
}
