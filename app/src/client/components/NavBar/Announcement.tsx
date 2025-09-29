const ANNOUNCEMENT_URL = '/pricing';

export function Announcement() {
  return (
    <div className='relative flex justify-center items-center gap-3 p-3 w-full bg-gradient-to-r from-primary via-secondary to-primary-foreground/70 font-semibold text-primary-foreground text-center'>
      <span className='hidden lg:block uppercase tracking-widest text-xs text-primary-foreground/80'>Latest update</span>
      <div className='hidden lg:block self-stretch w-0.5 bg-primary-foreground/20'></div>
      <a
        href={ANNOUNCEMENT_URL}
        className='cursor-pointer rounded-full bg-background/20 px-3 py-1 text-xs hover:bg-background/30 transition-colors'
      >
        Export-ready travel estimates now available →
      </a>
    </div>
  );
}
