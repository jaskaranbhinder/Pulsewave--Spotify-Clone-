from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import struct
import html
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "Pulsewave_Project_Presentation.pptx"
EMU = 914400
SW, SH = 13.333333, 7.5
COLORS = {"bg":"101211","panel":"1B201E","panel2":"252C28","white":"F5F7F5","muted":"B8C1BB","green":"1ED760","teal":"71D8BE","line":"39413D"}
slides = []

def E(v): return str(round(v*EMU))
def esc(v): return html.escape(str(v), quote=False)

class Slide:
    def __init__(self, title, eyebrow="PULSEWAVE PROJECT"):
        self.shapes=[]; self.rels=[]; self.next_id=2
        self.text(eyebrow.upper(),.58,.32,10,.22,9,COLORS["green"],True)
        self.text(title,.58,.68,12.1,.50,25,COLORS["white"],True)
        self.rect(.58,1.30,.30,.045,COLORS["green"])
        self.rect(.58,7.08,12.18,.012,COLORS["line"])
        self.text("FRONT END ENGINEERING-II  /  PULSEWAVE",.58,7.14,8,.16,8,COLORS["muted"])
    def rect(self,x,y,w,h,fill,line=None,radius=False,name="Panel"):
        i=self.next_id; self.next_id+=1
        geom="roundRect" if radius else "rect"
        f=f'<a:solidFill><a:srgbClr val="{fill}"/></a:solidFill>' if fill else '<a:noFill/>'
        ln=f'<a:ln w="12700"><a:solidFill><a:srgbClr val="{line}"/></a:solidFill></a:ln>' if line else '<a:ln><a:noFill/></a:ln>'
        self.shapes.append(f'<p:sp><p:nvSpPr><p:cNvPr id="{i}" name="{esc(name)}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="{E(x)}" y="{E(y)}"/><a:ext cx="{E(w)}" cy="{E(h)}"/></a:xfrm><a:prstGeom prst="{geom}"><a:avLst/></a:prstGeom>{f}{ln}</p:spPr></p:sp>')
    def text(self,value,x,y,w,h,size=14,color=None,bold=False,*,fill=None,line=None,radius=False,align="l",font="Aptos",margin=.06):
        i=self.next_id; self.next_id+=1
        c=color or COLORS["white"]
        lines=str(value).split("\n"); paras=[]
        for line_text in lines:
            if not line_text: paras.append('<a:p><a:endParaRPr lang="en-US"/></a:p>'); continue
            paras.append(f'<a:p><a:pPr algn="{align}"/><a:r><a:rPr lang="en-US" sz="{int(size*100)}" b="{1 if bold else 0}"><a:solidFill><a:srgbClr val="{c}"/></a:solidFill><a:latin typeface="{font}"/></a:rPr><a:t>{esc(line_text)}</a:t></a:r><a:endParaRPr lang="en-US"/></a:p>')
        geom="roundRect" if radius else "rect"
        f=f'<a:solidFill><a:srgbClr val="{fill}"/></a:solidFill>' if fill else '<a:noFill/>'
        ln=f'<a:ln w="12700"><a:solidFill><a:srgbClr val="{line}"/></a:solidFill></a:ln>' if line else '<a:ln><a:noFill/></a:ln>'
        body=f'<p:txBody><a:bodyPr wrap="square" lIns="{E(margin)}" rIns="{E(margin)}" tIns="{E(margin)}" bIns="{E(margin)}"><a:spAutoFit/></a:bodyPr><a:lstStyle/>{"".join(paras)}</p:txBody>'
        self.shapes.append(f'<p:sp><p:nvSpPr><p:cNvPr id="{i}" name="Text {i}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="{E(x)}" y="{E(y)}"/><a:ext cx="{E(w)}" cy="{E(h)}"/></a:xfrm><a:prstGeom prst="{geom}"><a:avLst/></a:prstGeom>{f}{ln}</p:spPr>{body}</p:sp>')
    def image(self,path,x,y,w,h,name="Existing project screenshot"):
        path=Path(path); iw,ih=struct.unpack(">II",path.read_bytes()[16:24]); scale=min(w/iw,h/ih); w2,h2=iw*scale,ih*scale; x+= (w-w2)/2; y+=(h-h2)/2
        rid=f"rId{len(self.rels)+2}"; i=self.next_id; self.next_id+=1; media=f"s{len(slides)+1}_{rid}.png"; self.rels.append((rid,media,path))
        self.shapes.append(f'<p:pic><p:nvPicPr><p:cNvPr id="{i}" name="{esc(name)}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="{rid}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="{E(x)}" y="{E(y)}"/><a:ext cx="{E(w2)}" cy="{E(h2)}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:ln><a:noFill/></a:ln></p:spPr></p:pic>')

def new(title,eyebrow="PULSEWAVE PROJECT"):
    s=Slide(title,eyebrow); slides.append(s); return s
def card(s,x,y,w,h,title,body,accent=None,body_size=12):
    s.rect(x,y,w,h,COLORS["panel"],COLORS["line"],True)
    s.rect(x+.18,y+.18,.045,h-.36,accent or COLORS["green"])
    s.text(title,x+.34,y+.20,w-.54,.34,16,COLORS["white"],True,margin=0)
    s.text(body,x+.34,y+.65,w-.56,h-.78,body_size,COLORS["muted"],margin=0)

# 1
s=new("Pulsewave","FRONT END ENGINEERING-II  /  PROJECT PRESENTATION")
s.text("A Spotify-inspired music streaming web application",.68,1.55,6.0,.86,25,COLORS["white"],True,margin=0)
s.text("A frontend demonstration of music discovery, playlists, playback controls, and local audio import.",.68,2.55,5.8,.76,17,COLORS["muted"],margin=0)
s.image(ROOT/"home-render.png",.68,3.52,5.85,1.68,"Existing player screenshot")
s.text("Existing project capture • empty player state",.73,5.26,5.7,.2,9,COLORS["muted"],margin=0)
s.text("Student: [Your name]\nRegistration no.: [Your registration number]\nUniversity / Faculty: [Your university and faculty]",.68,5.65,5.85,.88,13,COLORS["white"],fill=COLORS["panel"],line=COLORS["line"],radius=True,margin=.16)
s.rect(6.93,1.55,5.68,4.98,"163C2C",None,True)
s.image(ROOT/"public-home-render.png",7.18,1.84,5.18,4.38,"Existing public homepage capture")
s.text("Existing project captures, not taken during this presentation task.",7.18,6.32,5.18,.20,8,COLORS["muted"],margin=0)

# 2
s=new("Project overview")
s.text("Pulsewave brings the familiar parts of a music app into one React interface.",.68,1.62,11.9,.62,22,COLORS["white"],True,margin=0)
s.text("The project demonstrates how a frontend can organize discovery, playlists, playback controls, personal likes, and music files selected by the listener. It is a local browser experience, not a production streaming service.",.68,2.42,11.75,.9,16,COLORS["muted"],margin=0)
card(s,.68,3.78,3.82,1.75,"Discover","Browse featured tracks, stations, and artist collections.",COLORS["teal"])
card(s,4.76,3.78,3.82,1.75,"Listen","Choose sample or imported tracks and use shared playback controls.")
card(s,8.84,3.78,3.82,1.75,"Personalize","Save likes, queue tracks, and revisit recent playback.","B1A4FF")
s.text("FRONTEND DEMO  •  NO STREAMING BACKEND  •  NO REAL ACCOUNT OR PAYMENTS",.68,6.12,11.9,.36,11,COLORS["green"],True,fill="183C2A",radius=True,align="ctr",margin=.07)

# 3
s=new("Project objectives")
objs=[("01","Music-player interface","Create a dark, familiar desktop listening layout."),("02","Component-based React","Separate public pages, player views, and shared state."),("03","Interactive navigation","Connect public pages, playlists, search, and player routes."),("04","Track discovery","Present demo tracks, stations, and playlist collections."),("05","User preferences","Persist likes, recent tracks, and volume in the browser."),("06","Local music","Read supported audio files and available ID3 metadata locally.")]
for j,(n,t,b) in enumerate(objs):
    x=.68+(j%3)*4.08;y=1.72+(j//3)*2.17
    s.rect(x,y,3.82,1.74,COLORS["panel"],COLORS["line"],True)
    s.text(n,x+.20,y+.18,.5,.26,12,COLORS["green"],True,margin=0)
    s.text(t,x+.20,y+.59,3.4,.34,16,COLORS["white"],True,margin=0)
    s.text(b,x+.20,y+1.06,3.38,.48,12,COLORS["muted"],margin=0)

# 4
s=new("Technology stack")
stack=[("React 19","Component rendering and UI composition."),("JavaScript + JSX","Application logic, event handling, and React markup."),("CSS","Responsive dark interface and component styling."),("Vite","Development server and production build tooling."),("Context API + hooks","Shared player state with useState, useEffect, useMemo, and useCallback."),("Browser storage","localStorage for preferences; IndexedDB for the directory handle.")]
for j,(t,b) in enumerate(stack):
    x=.68+(j%2)*6.10;y=1.64+(j//2)*1.47
    card(s,x,y,5.8,1.16,t,b,COLORS["teal"] if j>=4 else COLORS["green"],11)
s.text("lucide-react supplies interface icons. No Redux or backend service is used.",.68,6.28,11.9,.35,12,COLORS["muted"],margin=0)

# 5
s=new("Application architecture")
nodes=[("src/main.jsx","StrictMode\nPlayerProvider wraps App"),("src/App.jsx","Route selection\nPlayer shell and views"),("PublicExperience.jsx","Landing, auth, Premium, account demo"),("Player UI + Context","App.jsx uses usePlayer()")]
for j,(t,b) in enumerate(nodes):
    x=.68+j*3.15
    s.text(t,x,1.75,2.75,.62,15,COLORS["white"],True,fill=COLORS["panel"],line=COLORS["line"],radius=True,align="ctr",margin=.08)
    s.text(b,x,2.48,2.75,.60,11,COLORS["muted"],align="ctr",margin=0)
    if j<3:s.rect(x+2.82,2.02,.24,.035,COLORS["green"])
card(s,.68,3.55,3.82,2.0,"Shared player state","Track, audio, queue, likes, volume, shuffle, repeat, and recent IDs.",COLORS["green"],12)
card(s,4.76,3.55,3.82,2.0,"Music data","musicData.js supplies sample tracks and VIBE playlist IDs. Imported tracks join at runtime.",COLORS["teal"],12)
card(s,8.84,3.55,3.82,2.0,"Persistence","localStorage stores likes, volume, and recent IDs. IndexedDB stores a folder handle.","B1A4FF",12)
s.text("File names and component relationships are taken from the current source.",.68,6.12,11.8,.32,11,COLORS["muted"],margin=0)

# 6
s=new("Public homepage")
s.text("Header navigation, library prompts, song discovery cards, artist rail, and sign-up banner.",.68,1.48,11.8,.38,14,COLORS["muted"],margin=0)
s.rect(.68,2.00,11.95,4.49,"080909",COLORS["line"],True)
s.image(ROOT/"public-home-render.png",.78,2.10,11.75,4.29,"Existing public homepage project capture")
s.text("Existing project capture from an earlier session. Not a fresh browser render.",.70,6.61,11.7,.2,9,COLORS["muted"],margin=0)

# 7
s=new("Login and sign-up")
s.text("Both forms use controlled email state, trim input, validate format, and respond without a backend.",.68,1.46,11.9,.40,14,COLORS["muted"],margin=0)
for img,title,x in [(ROOT/"login-render.png","Login",.68),(ROOT/"signup-render.png","Sign-up",6.84)]:
    s.rect(x,2.04,5.78,3.74,"080909",COLORS["line"],True)
    s.image(img,x+.10,2.14,5.58,3.54,title+" existing project capture")
    s.text(title,x+.08,5.90,3,.30,16,COLORS["white"],True,margin=0)
    s.text("Existing project capture",x+.08,6.24,5,.18,9,COLORS["muted"],margin=0)
s.text("Valid email shows a demo-only message. No password is requested, no account is created, and email is not saved.",.68,6.58,11.9,.28,11,COLORS["green"],margin=0)

# 8
s=new("Premium plans and account dashboard")
s.text("Public route opens plan options; account route provides clearly labeled frontend-only demo controls.",.68,1.46,11.8,.4,14,COLORS["muted"],margin=0)
for img,title,x in [(ROOT/"references"/"Screenshot 2026-10-25 120435.png","Premium plans",.68),(ROOT/"references"/"Screenshot 2026-10-25 120423.png","Account dashboard",6.84)]:
    s.rect(x,2.04,5.78,3.72,"080909",COLORS["line"],True)
    s.image(img,x+.1,2.14,5.58,3.52,title+" supplied design reference")
    s.text(title,x+.08,5.88,4.8,.28,16,COLORS["white"],True,margin=0)
    s.text("Supplied reference image, not a fresh app capture",x+.08,6.20,5.5,.19,8,COLORS["muted"],margin=0)
s.text("No payment, subscription change, or real account data is connected.",.68,6.57,11.8,.28,11,COLORS["green"],margin=0)

# 9
s=new("Music player")
s.text("App.jsx composes the library, main content, optional Now Playing panel, and bottom audio controls.",.68,1.46,11.9,.4,14,COLORS["muted"],margin=0)
s.rect(.68,2.02,9.72,4.48,"080909",COLORS["line"],True)
s.image(ROOT/"home-render.png",.78,2.12,9.52,4.28,"Existing player capture, empty state")
s.rect(10.64,2.02,1.96,4.48,COLORS["panel"],COLORS["line"],True)
s.text("Controls",10.82,2.25,1.6,.32,15,COLORS["white"],True,margin=0)
s.text("Play / pause\nPrevious / next\nSeek and volume\nShuffle / repeat\nQueue and likes",10.82,2.78,1.6,1.7,11,COLORS["muted"],margin=0)
s.text("Prior capture shows the empty player state.",10.82,4.82,1.58,.8,10,COLORS["teal"],margin=0)
s.text("Current browser interaction and responsive rendering were not tested for this deck.",.68,6.62,11.7,.2,9,COLORS["muted"],margin=0)

# 10
s=new("Playlists and search")
s.text("VIBE maps to sample track IDs. Liked Songs is built from the saved liked-ID list.",.68,1.46,11.9,.4,14,COLORS["muted"],margin=0)
for img,title,x in [(ROOT/"vibe-render.png","VIBE playlist",.68),(ROOT/"liked-render.png","Liked Songs",6.84)]:
    s.rect(x,2.04,5.78,3.80,"080909",COLORS["line"],True)
    s.image(img,x+.1,2.14,5.58,3.60,title+" existing project capture")
    s.text(title,x+.08,5.96,4.8,.28,16,COLORS["white"],True,margin=0)
s.text("Search matches title, artist, album, and imported filename. Selecting a result calls playTrack().",.68,6.36,11.8,.32,12,COLORS["muted"],margin=0)
s.text("Existing captures; not freshly browser-verified.",.68,6.77,11.8,.16,8,COLORS["muted"],margin=0)

# 11
s=new("Queue and recently played")
s.rect(.68,1.62,4.42,4.95,"080909",COLORS["line"],True)
s.image(ROOT/"queue-panel-render.png",.81,1.75,4.16,4.69,"Existing queue panel capture")
s.text("Existing queue panel capture",.76,6.65,4.2,.18,8,COLORS["muted"],margin=0)
card(s,5.40,1.62,7.20,1.43,"Queue","Queue IDs live in PlayerContext. Next playback consumes the first available queued track.",COLORS["green"],11)
card(s,5.40,3.31,7.20,1.43,"Recent history","playTrack() moves the selected stable ID to the front, removes duplicates, and keeps up to 12 IDs.",COLORS["teal"],11)
card(s,5.40,5.00,7.20,1.43,"Persistence","Recent IDs are restored from and written to localStorage under pulsewave-recent-tracks.","B1A4FF",11)

# 12
s=new("Local music import")
s.text("Audio files are selected by the listener and processed in the browser.",.68,1.48,11.8,.4,17,COLORS["white"],True,margin=0)
steps=[("01","Choose a folder","File System Access API when available; directory-input fallback otherwise."),("02","Read supported files","Audio extensions and audio MIME types are accepted."),("03","Read tags and cover","ID3 title, artist, album, and APIC/PIC artwork are parsed when present."),("04","Add to player","Stable ID, duration, metadata, and object URLs become runtime track data.")]
for j,(n,t,b) in enumerate(steps):
    y=2.12+j*1.02
    s.rect(.68,y,7.32,.82,COLORS["panel"],COLORS["line"],True)
    s.text(n,.87,y+.20,.45,.25,12,COLORS["green"],True,margin=0)
    s.text(t,1.46,y+.14,2.3,.28,14,COLORS["white"],True,margin=0)
    s.text(b,3.82,y+.14,3.9,.50,10,COLORS["muted"],margin=0)
s.rect(8.32,2.12,4.28,3.90,COLORS["panel"],COLORS["line"],True)
s.text("What persists?",8.60,2.42,3.7,.34,17,COLORS["white"],True,margin=0)
s.text("IndexedDB stores the directory handle.\n\nAudio files remain in their original folder.\n\nImported tracks use in-memory object URLs and may need re-import after reload.",8.60,3.02,3.65,2.38,12,COLORS["muted"],margin=0)
s.text("No personal music files were accessed. End-to-end import and playback were not tested for this presentation.",.68,6.48,11.8,.32,11,COLORS["green"],margin=0)

# 13
s=new("React concepts in the code")
s.text("Source-based examples: shared state, hook usage, and controlled form handling.",.68,1.46,11.8,.38,14,COLORS["muted"],margin=0)
s.rect(.68,2.02,5.82,4.43,COLORS["panel"],COLORS["line"],True)
s.text("Shared playback state",.93,2.25,5.2,.32,16,COLORS["white"],True,margin=0)
s.text("// main.jsx\n<PlayerProvider>\n  <App />\n</PlayerProvider>\n\n// PlayerContext.jsx\nconst [currentId, setCurrentId] = useState(null)\nconst [recentTrackIds, setRecentTrackIds] = useState(readRecentTracks)",.93,2.80,5.25,2.86,10,"D9E5DD",fill="121614",radius=True,font="Consolas",margin=.12)
s.text("usePlayer() exposes provider state and actions to player views.",.93,5.84,5.2,.38,10,COLORS["muted"],margin=0)
s.rect(6.78,2.02,5.82,4.43,COLORS["panel"],COLORS["line"],True)
s.text("Controlled email form",7.03,2.25,5.2,.32,16,COLORS["white"],True,margin=0)
s.text("const [email, setEmail] = useState('')\n\nconst trimmedEmail = email.trim()\nif (!trimmedEmail) {\n  setError('Enter your email address.')\n  return\n}\n\n// Demo message only; not sent or saved.",7.03,2.80,5.25,2.86,10,"D9E5DD",fill="121614",radius=True,font="Consolas",margin=.12)
s.text("AuthPage handles submit, labels, and accessible error text.",7.03,5.84,5.2,.38,10,COLORS["muted"],margin=0)

# 14
s=new("Testing and limitations")
s.text("REPORTED VALIDATION FROM THE EXISTING PROJECT PASS",.68,1.54,6,.28,10,COLORS["green"],True,margin=0)
checks=[("Build","npm.cmd run build passed during this presentation task."),("Lint","npm.cmd run lint passed during this presentation task."),("Static routes","Routes were inspected; Vite returned HTTP 200 for checked destinations."),("Rendering","HTTP 200 confirms an app shell response, not a rendered React route."),("Browser QA","Rendered layouts, interactions, console, and responsive behavior remain unverified."),("Local import","Importing and playing personal files was not tested.")]
for j,(t,b) in enumerate(checks):
    y=1.98+j*.72
    s.rect(.68,y,11.92,.56,COLORS["panel"],COLORS["line"],True)
    s.text(t,.9,y+.14,1.9,.24,13,COLORS["white"],True,margin=0)
    s.text(b,2.95,y+.13,9.35,.28,11,COLORS["muted"],margin=0)
s.text("No browser automation or screenshot rendering tool was available in this environment.",.70,6.47,11.8,.30,12,COLORS["teal"],margin=0)

# 15
s=new("Conclusion and future scope")
s.text("Pulsewave demonstrates a connected, component-based frontend for music discovery and playback.",.68,1.60,11.8,.65,22,COLORS["white"],True,margin=0)
s.text("The application combines public-facing pages with a local player, playlists, queue, likes, search, recent history, and browser-based audio import.",.68,2.48,11.8,.78,16,COLORS["muted"],margin=0)
s.text("IMPLEMENTED IN THIS FRONTEND DEMO",.68,3.64,5.5,.3,11,COLORS["green"],True,margin=0)
s.text("Public homepage and demo account pages\nReact player with shared state\nPlaylists, search, queue, likes, and history\nLocal audio import workflow",.68,4.06,5.8,1.45,13,COLORS["white"],fill=COLORS["panel"],line=COLORS["line"],radius=True,margin=.16)
s.text("FUTURE SCOPE",6.84,3.64,5.3,.3,11,COLORS["teal"],True,margin=0)
s.text("Real authentication and backend\nRemote licensed music catalogue\nCloud library persistence\nSubscription integration",6.84,4.06,5.8,1.45,13,COLORS["white"],fill=COLORS["panel"],line=COLORS["line"],radius=True,margin=.16)
s.text("Thank you",.68,6.02,11.8,.46,24,COLORS["green"],True,align="ctr",margin=0)

def make_slide_xml(s):
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="{COLORS["bg"]}"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>{"".join(s.shapes)}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>'''

def build():
    files={}
    overrides=['<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>','<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>','<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>','<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>']
    overrides += [f'<Override PartName="/ppt/slides/slide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>' for i in range(1,len(slides)+1)]
    files['[Content_Types].xml']='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/> '+''.join(overrides)+'</Types>'
    files['_rels/.rels']='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>'
    sid=''.join(f'<p:sldId id="{255+i}" r:id="rId{i}"/>' for i in range(1,len(slides)+1))
    files['ppt/presentation.xml']=f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId{len(slides)+1}"/></p:sldMasterIdLst><p:sldIdLst>{sid}</p:sldIdLst><p:sldSz cx="{round(SW*EMU)}" cy="{round(SH*EMU)}" type="screen16x9"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>'
    prsrels=[f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide{i}.xml"/>' for i in range(1,len(slides)+1)]
    prsrels.append(f'<Relationship Id="rId{len(slides)+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>')
    files['ppt/_rels/presentation.xml.rels']='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+''.join(prsrels)+'</Relationships>'
    files['ppt/slideMasters/slideMaster1.xml']='''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="1" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles></p:sldMaster>'''
    files['ppt/slideMasters/_rels/slideMaster1.xml.rels']='''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>'''
    files['ppt/slideLayouts/slideLayout1.xml']='''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1"><p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>'''
    files['ppt/slideLayouts/_rels/slideLayout1.xml.rels']='''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>'''
    fills='<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>'*3
    lines=''.join(f'<a:ln w="{6350+i*1270}"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>' for i in range(3))
    effects='<a:effectStyle><a:effectLst/></a:effectStyle>'*3
    files['ppt/theme/theme1.xml']=f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Pulsewave"><a:themeElements><a:clrScheme name="Pulsewave"><a:dk1><a:srgbClr val="{COLORS["bg"]}"/></a:dk1><a:lt1><a:srgbClr val="{COLORS["white"]}"/></a:lt1><a:dk2><a:srgbClr val="{COLORS["panel"]}"/></a:dk2><a:lt2><a:srgbClr val="{COLORS["muted"]}"/></a:lt2><a:accent1><a:srgbClr val="{COLORS["green"]}"/></a:accent1><a:accent2><a:srgbClr val="{COLORS["teal"]}"/></a:accent2><a:accent3><a:srgbClr val="B1A4FF"/></a:accent3><a:accent4><a:srgbClr val="{COLORS["line"]}"/></a:accent4><a:accent5><a:srgbClr val="8C9D92"/></a:accent5><a:accent6><a:srgbClr val="{COLORS["panel2"]}"/></a:accent6><a:hlink><a:srgbClr val="{COLORS["green"]}"/></a:hlink><a:folHlink><a:srgbClr val="{COLORS["teal"]}"/></a:folHlink></a:clrScheme><a:fontScheme name="Pulsewave"><a:majorFont><a:latin typeface="Aptos"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Aptos"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="Pulsewave"><a:fillStyleLst>{fills}</a:fillStyleLst><a:lnStyleLst>{lines}</a:lnStyleLst><a:effectStyleLst>{effects}</a:effectStyleLst><a:bgFillStyleLst>{fills}</a:bgFillStyleLst></a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>'''
    for i,s in enumerate(slides,1):
        files[f'ppt/slides/slide{i}.xml']=make_slide_xml(s)
        rels=['<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>']
        for rid,media,path in s.rels:
            rels.append(f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/{media}"/>')
            files[f'ppt/media/{media}']=path.read_bytes()
        files[f'ppt/slides/_rels/slide{i}.xml.rels']='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+''.join(rels)+'</Relationships>'
    with ZipFile(OUT,'w',ZIP_DEFLATED) as z:
        for name,data in files.items(): z.writestr(name,data.encode("utf-8") if isinstance(data,str) else data)
    with ZipFile(OUT) as z:
        names=z.namelist()
        assert len([n for n in names if n.startswith("ppt/slides/slide") and n.endswith(".xml")])==15
        for name in names:
            if name.endswith(".xml") or name.endswith(".rels"): ET.fromstring(z.read(name))
    print(f"Created {OUT} ({OUT.stat().st_size:,} bytes). 15 slides; package and XML validation passed.")

if __name__=="__main__": build()
