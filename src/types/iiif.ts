export interface IIIFLabel {
  en?: string | string[];
}

export interface IIIFClass {
  id: string;
  type: string;
  label?: IIIFLabel;
}

export interface IIIFResource {
  id?: string;
  type: string;
  language?: string;
  format?: string;
  value?: string;
  motivation?: string;
  purpose?: string;
  duration?: number;
}

export interface IIIFAnnotationTarget {
  source: {
    id: string;
    type: string;
    partOf: IIIFClass[];
  };
  selector: {
    type: string;
    t: string;
  };
}
export interface IIIFAnnotationItem extends IIIFClass {
  motivation: string | string[];
  '@context'?: string;
  body: IIIFResource | IIIFResource[];
  target: IIIFAnnotationTarget | string;
}

export interface IIIFAnnotationPage extends IIIFClass {
  '@context'?: string | string[];
  items?: IIIFAnnotationItem[];
}

export interface IIIFHomepage extends IIIFClass {
  format: string;
}

export interface IIIFProvider extends IIIFClass {}

export interface IIIFCanvas extends IIIFClass {
  duration: number;
  annotations: IIIFAnnotationPage[];
  items: IIIFAnnotationPage[];
}
export interface IIIFPresentationManifest extends IIIFClass {
  '@context': string;
  homepage: IIIFHomepage[];
  provider?: IIIFProvider[];
  items: IIIFCanvas[];
}
