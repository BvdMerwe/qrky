import cc from 'classcat';

export type TitleProps = {
    className?: string;
    isLarge: boolean;
    children?: React.ReactNode;
};

export default function Title({ className, isLarge, children }: TitleProps) {
    return (
        <h1 className={cc(['font-semibold', {
            'text-5xl': !isLarge,
            'text-6xl': isLarge,
        }, className])}>{children}</h1>
    );
}