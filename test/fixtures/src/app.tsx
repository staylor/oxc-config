import { useState } from 'react';
import { useState as useStateAgain } from 'react';

namespace Legacy {
  export const value = 1;
}

export function App({ items }: { items: string[] }) {
  const unused = 1;
  const [count] = useState(0);
  useStateAgain(0);

  if (count == 1) {
    fetch('/api').then((response) => response);
  }

  return (
    <ul>
      <img src="logo.png" />
      {items.map((item) => (
        <li>{item}</li>
      ))}
    </ul>
  );
}
