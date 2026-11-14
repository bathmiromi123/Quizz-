#!/usr/bin/env python3
"""Build a catalog from data/<subject>/<term>.json. No API key required."""
import json,re,pathlib,sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
DATA=ROOT/'data'
ORDER={'SP':0,'SU':1,'FA':2}
def sort_key(e):
 m=re.fullmatch(r'(SP|SU|FA)(\d{2,4})',e['term'].upper())
 if not m:return (-1,-1,e['term'])
 return (int(m.group(2)),ORDER[m.group(1)],e['term'])
def build():
 result=[]
 for folder in sorted(DATA.iterdir()):
  if not folder.is_dir() or folder.name=='images':continue
  arr=[]
  for file in sorted(folder.glob('*.json')):
   data=json.loads(file.read_text(encoding='utf-8'))
   if not isinstance(data.get('questions'),list) or not data['questions']:raise ValueError('Invalid quiz: '+str(file))
   arr.append({'term':file.stem.upper(),'file':file.relative_to(ROOT).as_posix(),'count':len(data['questions'])})
  if arr:result.append({'id':folder.name,'name':folder.name.upper(),'exams':sorted(arr,key=sort_key,reverse=True)})
 (DATA/'catalog.json').write_text(json.dumps({'subjects':result},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print('Catalog:',len(result),'subjects,',sum(len(s['exams']) for s in result),'exams')
if __name__=='__main__':build()
