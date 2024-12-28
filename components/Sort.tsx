"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {usePathname, useRouter} from "next/navigation";
import {sortTypes} from "@/constants";


const Sort = () => {

  const path = usePathname()
  const router = useRouter();

  const sort = (value: string) => {
    router.push(`${path}?sort=${value}`);
  }

  return <Select onValueChange={sort} defaultValue={sortTypes[0].value}>
    <SelectTrigger className="sort-select">
      <SelectValue placeholder={sortTypes[0].value} />
    </SelectTrigger>
    <SelectContent className="sort-select-content">
      {sortTypes.map((filter) => (
      <SelectItem key={filter.label} className="shad-select-item" value={filter.value}>{filter.label}</SelectItem>
      ))}
    </SelectContent>
  </Select>

};
export default Sort;
