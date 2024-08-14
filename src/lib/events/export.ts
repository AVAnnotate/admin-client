import { serialize } from "@lib/slate/index.tsx";
import type { AnnotationEntry, Event } from "@ty/Types.ts";
import { formatTimestamp } from "./index.ts";
import ReactDOMServer from 'react-dom/server'
import type { Node } from "slate";

// add a \ to escape any quotes, and surround the value in quotes
const formatField = (str: string) => `"${str.replaceAll("\"", "\\\"")}"`

const serializeRichText = (nodes: Node[]) => ReactDOMServer.renderToString(serialize(nodes))

export const exportAnnotations = (annos: AnnotationEntry[], event: Event, avFile: string) => {
  let str = "Start Time,End Time,Annotation,Tags (comma separated),AV File (URL)\n"

  annos.forEach(anno => {
    const fields = [
      Number.isInteger(anno.start_time) ? formatTimestamp(anno.start_time, false) : '',
      Number.isInteger(anno.end_time) ? formatTimestamp(anno.end_time, false) : '',
      anno.annotation ? serializeRichText(anno.annotation) : '',
      anno.tags.map(t => t.tag).join(', ') || '',
      event.audiovisual_files[avFile].file_url || ''
    ]

    str += fields.map(formatField).join(',')
    str += "\n"
  })

  const data = encodeURIComponent(str)

  const el = document.createElement('a')
  el.download = `${event.label}.csv`
  el.href = 'data:text/csv;charset=UTF-8,' + '\uFEFF' + data
  el.click()
}
