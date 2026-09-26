// Provides report icons, time labels, sorting and feed filtering helpers.
// Returns the Ionicon name that matches each disaster type.
export const getTypeIconName = (type) => {
  switch (type) {
    case 'Flood':
      return 'water-outline';
    case 'Fire':
      return 'flame-outline';
    case 'Storm':
      return 'thunderstorm-outline';
    case 'Power Outage':
      return 'flash-outline';
    default:
      return 'alert-circle-outline';
  }
};

// Converts report age in minutes into a short readable time label.
export const formatRelativeTime = (minutesAgo) => {
  if (minutesAgo < 60) {
    return `${minutesAgo} min ago`;
  }

  const hours = Math.floor(minutesAgo / 60);
  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day ago`;
};

// Sorts a copy of the report list from newest to oldest.
export const sortReportsNewest = (reports) =>
  [...reports].sort((a, b) => (a.createdAt || 0) > (b.createdAt || 0) ? -1 : 1);

// Applies area, disaster-type and free-text filters before returning the feed list.
export const filterReports = ({ reports = [], selectedArea = 'All', selectedType = 'All', searchText = '' }) => {
  const query = searchText.trim().toLowerCase();

  return sortReportsNewest(reports).filter((report) => {
    const areaMatches = selectedArea === 'All' || report.area === selectedArea;
    const typeMatches = selectedType === 'All' || report.type === selectedType;
    const searchMatches =
      query.length === 0 ||
      [report.type, report.location, report.description, report.area, report.postalCode]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);

    return areaMatches && typeMatches && searchMatches;
  });
};
