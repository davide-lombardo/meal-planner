import * as React from "react";
import { Button, Typography } from "@mui/joy";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@mui/joy/styles";

interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const JoyPagination: React.FC<PaginationProps> = ({
  page,
  total,
  pageSize,
  onPageChange,
}) => {
  const theme = useTheme();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const maxButtons = 7;
  const pageButtons: React.ReactNode[] = [];

  pageButtons.push(
    <Button
      key="prev"
      variant="plain"
      color="neutral"
      startDecorator={<ChevronLeft size={18} />}
      sx={{ borderRadius: 8, minWidth: 36, mx: 0.25, px: 1.5, fontWeight: 500 }}
      disabled={page === 1}
      onClick={() => onPageChange(page - 1)}
    >
      Prev
    </Button>
  );

  // Page numbers
  if (totalPages <= maxButtons) {
    for (let i = 1; i <= totalPages; i++) {
      pageButtons.push(
        <Button
          key={i}
          variant={i === page ? "solid" : "outlined"}
          color={i === page ? "success" : "neutral"}
          sx={{
            borderRadius: 8,
            minWidth: 36,
            mx: 0.25,
            fontWeight: 600,
            boxShadow:
              i === page
                ? `0 0 0 2px ${theme.palette.primary[500]}`
                : undefined,
          }}
          onClick={() => onPageChange(i)}
          disabled={i === page}
        >
          {i}
        </Button>
      );
    }
  } else {
    const first = 1;
    const last = totalPages;
    const neighbors = 1;
    let start = Math.max(page - neighbors, first + 1);
    let end = Math.min(page + neighbors, last - 1);
    if (start <= first + 1) {
      start = first + 1;
      end = start + 2;
    }
    if (end >= last - 1) {
      end = last - 1;
      start = end - 2;
    }
    pageButtons.push(
      <Button
        key={first}
        variant={page === first ? "solid" : "outlined"}
        color={page === first ? "success" : "neutral"}
        sx={{
          borderRadius: 8,
          minWidth: 36,
          mx: 0.25,
          fontWeight: 600,
          boxShadow:
            page === first
              ? `0 0 0 2px ${theme.palette.primary[500]}`
              : undefined,
        }}
        onClick={() => onPageChange(first)}
        disabled={page === first}
      >
        {first}
      </Button>
    );
    if (start > first + 1) {
      pageButtons.push(
        <Typography
          key="start-ellipsis"
          sx={{
            mx: 0.25,
            fontWeight: 700,
            fontSize: 22,
            color: "text.secondary",
          }}
        >
          ...
        </Typography>
      );
    }
    for (let i = start; i <= end; i++) {
      pageButtons.push(
        <Button
          key={i}
          variant={i === page ? "solid" : "outlined"}
          color={i === page ? "success" : "neutral"}
          sx={{
            borderRadius: 8,
            minWidth: 36,
            mx: 0.25,
            fontWeight: 600,
            boxShadow:
              i === page
                ? `0 0 0 2px ${theme.palette.primary[500]}`
                : undefined,
          }}
          onClick={() => onPageChange(i)}
          disabled={i === page}
        >
          {i}
        </Button>
      );
    }
    if (end < last - 1) {
      pageButtons.push(
        <Typography
          key="end-ellipsis"
          sx={{
            mx: 0.25,
            fontWeight: 700,
            fontSize: 22,
            color: "text.secondary",
          }}
        >
          ...
        </Typography>
      );
    }
    pageButtons.push(
      <Button
        key={last}
        variant={page === last ? "solid" : "outlined"}
        color={page === last ? "success" : "neutral"}
        sx={{
          borderRadius: 8,
          minWidth: 36,
          mx: 0.25,
          fontWeight: 600,
          boxShadow:
            page === last
              ? `0 0 0 2px ${theme.palette.primary[500]}`
              : undefined,
        }}
        onClick={() => onPageChange(last)}
        disabled={page === last}
      >
        {last}
      </Button>
    );
  }

  pageButtons.push(
    <Button
      key="next"
      variant="plain"
      color="neutral"
      endDecorator={<ChevronRight size={18} />}
      sx={{ borderRadius: 8, minWidth: 36, mx: 0.25, px: 1.5, fontWeight: 500 }}
      disabled={page === totalPages}
      onClick={() => onPageChange(page + 1)}
    >
      Next
    </Button>
  );

  return <>{pageButtons}</>;
};

export default JoyPagination;
