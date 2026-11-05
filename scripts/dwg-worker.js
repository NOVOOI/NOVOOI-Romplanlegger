import {LibreDwg,Dwg_File_Type} from '@mlightcad/libredwg-web';
import {extractDwg} from './dwg-extract.mjs';
self.onmessage=async event=>{let api,id;try{api=await LibreDwg.create(new URL('./',self.location.href).href.replace(/\/$/,''));id=api.dwg_read_data(event.data,Dwg_File_Type.DWG);const result=extractDwg(api,id);self.postMessage(result,result.groups.map(g=>g.positions.buffer))}catch(error){self.postMessage({error:error?.message||'Kunne ikke lese DWG-filen'})}finally{if(api&&id)api.dwg_free(id)}};
