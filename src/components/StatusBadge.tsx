const statusColors: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  approved:  'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-700',
  assigned:  'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-50 text-red-400',
};

export const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
      statusColors[status] ?? 'bg-gray-100 text-gray-500'
    }`}
  >
    {status ?? 'unknown'}
  </span>
);
