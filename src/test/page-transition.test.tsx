import { useEffect } from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PageTransition } from '@/components/PageTransition';

afterEach(cleanup);

describe('Page content transitions', () => {
  it('keeps the current content mounted during rerenders', () => {
    const mount = vi.fn();
    const unmount = vi.fn();
    function Content({ value }: { value: string }) {
      useEffect(() => {
        mount();
        return unmount;
      }, []);
      return <p>{value}</p>;
    }
    const view = render(<PageTransition><Content value="current" /></PageTransition>);
    view.rerender(<PageTransition><Content value="updated" /></PageTransition>);
    expect(mount).toHaveBeenCalledTimes(1);
    expect(unmount).not.toHaveBeenCalled();
    expect(view.getByText('updated')).toBeInTheDocument();
  });

  it('replaces outgoing content when a different page mounts', () => {
    const unmount = vi.fn();
    function PreviousPage() {
      useEffect(() => unmount, []);
      return <PageTransition><p>Previous content</p></PageTransition>;
    }
    function NextPage() {
      return <PageTransition><p>Next content</p></PageTransition>;
    }
    const view = render(<PreviousPage />);
    view.rerender(<NextPage />);
    expect(unmount).toHaveBeenCalledTimes(1);
    expect(view.queryByText('Previous content')).not.toBeInTheDocument();
    expect(view.getByText('Next content')).toBeInTheDocument();
  });
});