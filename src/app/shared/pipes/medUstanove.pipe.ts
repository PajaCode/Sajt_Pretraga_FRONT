import { Pipe, PipeTransform } from "@angular/core";
import { MedUstanova } from "../models/medUstanova";

@Pipe({name: 'medUstanove'})
export class MedUstanovaPipe implements PipeTransform {
  transform(values: MedUstanova[], filterNaziv: string, filterGrad: string, filterAdresa: string): MedUstanova[] {
    if (!filterNaziv && !filterGrad && !filterAdresa) {
      return values;
    }

    return values.filter((value: MedUstanova) => {
      const nazivMatch = !filterNaziv || value.naziv.toLowerCase().includes(filterNaziv.toLowerCase());
      const gradMatch = !filterGrad || value.grad.toLowerCase().includes(filterGrad.toLowerCase());
      const adresaMatch = !filterAdresa || value.adresa.toLowerCase().includes(filterAdresa.toLowerCase());

      return nazivMatch && gradMatch && adresaMatch;
    });
  }
}
