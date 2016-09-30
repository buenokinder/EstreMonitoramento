﻿using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace rotateimage
{
    class Program
    {
        static void Main(string[] args)
        {
            var img = Image.FromFile(@"C:\Users\michel.oliveira\Desktop\chart.jpeg");
            var bmp = RotateImage(img, 90);
            bmp.Save(@"C:\Users\michel.oliveira\Desktop\chart_rotate.jpg");
        }
        
        //"<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NjUiIGhlaWdodD0iNDAwIj48ZGVzYz5DcmVhdGVkIHdpdGggSGlnaGNoYXJ0cyA0LjIuNTwvZGVzYz48ZGVmcz48Y2xpcFBhdGggaWQ9ImhpZ2hjaGFydHMtMSI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjUyNCIgaGVpZ2h0PSIyNDgiPjwvcmVjdD48L2NsaXBQYXRoPjwvZGVmcz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iNjY1IiBoZWlnaHQ9IjQwMCIgZmlsbD0iI0ZGRkZGRiIgY2xhc3M9IiBoaWdoY2hhcnRzLWJhY2tncm91bmQiPjwvcmVjdD48ZyBjbGFzcz0iaGlnaGNoYXJ0cy1ncmlkIj48L2c+PGcgY2xhc3M9ImhpZ2hjaGFydHMtZ3JpZCI+PHBhdGggZmlsbD0ibm9uZSIgZD0iTSA3NCAzMDEuNSBMIDU5OCAzMDEuNSIgc3Ryb2tlPSIjRDhEOEQ4IiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjEiPjwvcGF0aD48cGF0aCBmaWxsPSJub25lIiBkPSJNIDc0IDIzOS41IEwgNTk4IDIzOS41IiBzdHJva2U9IiNEOEQ4RDgiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMSI+PC9wYXRoPjxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0gNzQgMTc3LjUgTCA1OTggMTc3LjUiIHN0cm9rZT0iI0Q4RDhEOCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIxIj48L3BhdGg+PHBhdGggZmlsbD0ibm9uZSIgZD0iTSA3NCAxMTUuNSBMIDU5OCAxMTUuNSIgc3Ryb2tlPSIjRDhEOEQ4IiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjEiPjwvcGF0aD48cGF0aCBmaWxsPSJub25lIiBkPSJNIDc0IDUyLjUgTCA1OTggNTIuNSIgc3Ryb2tlPSIjRDhEOEQ4IiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjEiPjwvcGF0aD48L2c+PGcgY2xhc3M9ImhpZ2hjaGFydHMtZ3JpZCI+PHBhdGggZmlsbD0ibm9uZSIgZD0iTSA3NCAzMDEuNSBMIDU5OCAzMDEuNSIgc3Ryb2tlPSIjRDhEOEQ4IiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjEiPjwvcGF0aD48cGF0aCBmaWxsPSJub25lIiBkPSJNIDc0IDIzOS41IEwgNTk4IDIzOS41IiBzdHJva2U9IiNEOEQ4RDgiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMSI+PC9wYXRoPjxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0gNzQgMTc3LjUgTCA1OTggMTc3LjUiIHN0cm9rZT0iI0Q4RDhEOCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIxIj48L3BhdGg+PHBhdGggZmlsbD0ibm9uZSIgZD0iTSA3NCAxMTUuNSBMIDU5OCAxMTUuNSIgc3Ryb2tlPSIjRDhEOEQ4IiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjEiPjwvcGF0aD48cGF0aCBmaWxsPSJub25lIiBkPSJNIDc0IDUyLjUgTCA1OTggNTIuNSIgc3Ryb2tlPSIjRDhEOEQ4IiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjEiPjwvcGF0aD48L2c+PGcgY2xhc3M9ImhpZ2hjaGFydHMtYXhpcyI+PHBhdGggZmlsbD0ibm9uZSIgZD0iTSAxMDMuNSAzMDEgTCAxMDMuNSAzMTEiIHN0cm9rZT0iI0MwRDBFMCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIxIj48L3BhdGg+PHBhdGggZmlsbD0ibm9uZSIgZD0iTSAyMDEuNSAzMDEgTCAyMDEuNSAzMTEiIHN0cm9rZT0iI0MwRDBFMCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIxIj48L3BhdGg+PHBhdGggZmlsbD0ibm9uZSIgZD0iTSAzMDAuNSAzMDEgTCAzMDAuNSAzMTEiIHN0cm9rZT0iI0MwRDBFMCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIxIj48L3BhdGg+PHBhdGggZmlsbD0ibm9uZSIgZD0iTSAzOTkuNSAzMDEgTCAzOTkuNSAzMTEiIHN0cm9rZT0iI0MwRDBFMCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIxIj48L3BhdGg+PHBhdGggZmlsbD0ibm9uZSIgZD0iTSA0OTguNSAzMDEgTCA0OTguNSAzMTEiIHN0cm9rZT0iI0MwRDBFMCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIxIj48L3BhdGg+PHBhdGggZmlsbD0ibm9uZSIgZD0iTSA1OTcuNSAzMDEgTCA1OTcuNSAzMTEiIHN0cm9rZT0iI0MwRDBFMCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIxIj48L3BhdGg+PHBhdGggZmlsbD0ibm9uZSIgZD0iTSA3NCAzMDEuNSBMIDU5OCAzMDEuNSIgc3Ryb2tlPSIjQzBEMEUwIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD48L2c+PGcgY2xhc3M9ImhpZ2hjaGFydHMtYXhpcyI+PHRleHQgeD0iMjguMTQwNjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLDApIHJvdGF0ZSgyNzAgMjguMTQwNjI1IDE3NykiIGNsYXNzPSIgaGlnaGNoYXJ0cy15YXhpcy10aXRsZSIgc3R5bGU9ImNvbG9yOiM0MzQzNDg7ZmlsbDojNDM0MzQ4OyIgeT0iMTc3Ij48dHNwYW4+RGVzbG9jYW1lbnRvcyAoY20pPC90c3Bhbj48L3RleHQ+PC9nPjxnIGNsYXNzPSJoaWdoY2hhcnRzLWF4aXMiPjx0ZXh0IHg9IjYzNi45MDYyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwwKSByb3RhdGUoOTAgNjM2LjkwNjI1IDE3NykiIGNsYXNzPSIgaGlnaGNoYXJ0cy15YXhpcy10aXRsZSIgc3R5bGU9ImNvbG9yOiM3Y2I1ZWM7ZmlsbDojN2NiNWVjOyIgeT0iMTc3Ij48dHNwYW4+VmVsb2NpZGFkZSAoY20vZGlhKTwvdHNwYW4+PC90ZXh0PjwvZz48ZyBjbGFzcz0iaGlnaGNoYXJ0cy1zZXJpZXMtZ3JvdXAiPjxnIGNsYXNzPSJoaWdoY2hhcnRzLXNlcmllcyBoaWdoY2hhcnRzLXNlcmllcy0wIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg3NCw1Mykgc2NhbGUoMSAxKSIgY2xpcC1wYXRoPSJ1cmwoI2hpZ2hjaGFydHMtMSkiPjxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0gNS4xMzcyNTQ5MDE5NjA4IDI0OCBMIDM5MC4xNzUzNjMxNjg1MiAyNDAuNTYgTCAzOTIuMjIzNDM4MjEyNDkgMjQzLjA0IEwgMzk0Ljk1NDIwNDkzNzc5IDI0NC4yOCBMIDM5Ny4wMDIyNzk5ODE3NiAyMzkuMzIgTCAzOTkuMDUwMzU1MDI1NzMgMjQxLjggTCA0MDEuNzgxMTIxNzUxMDMgMjQ0LjI4IEwgNDA0Ljg1MzIzNDMxNjk4IDI0MS44IEwgNDA3LjI0MjY1NTIwMTYyIDI0My4wNCBMIDQwOC45NDkzODQ0MDQ5MiAyNDEuOCBMIDQxMS4zMzg4MDUyODk1NiAyNDMuMDQgTCA0MTMuNzI4MjI2MTc0MTkgMjQzLjA0IEwgNDE2LjExNzY0NzA1ODgyIDI0My4wNCBMIDQxOC41MDcwNjc5NDM0NiAyNDMuMDQgTCA0MjAuODk2NDg4ODI4MDkgMjQzLjA0IEwgNDIzLjI4NTkwOTcxMjcyIDI0MS44IEwgNDI1LjY3NTMzMDU5NzM2IDI0MS44IEwgNDI4LjA2NDc1MTQ4MTk5IDIyOC4xNiBMIDUuMTM3MjU0OTAxOTYwOCAyNDggTCAzOTAuMTc1MzYzMTY4NTIgMjI0LjQ0IEwgMzkyLjIyMzQzODIxMjQ5IDIyMy4yIEwgMzk0Ljk1NDIwNDkzNzc5IDIyMy4yIEwgMzk3LjAwMjI3OTk4MTc2IDIyNS42OCBMIDM5OS4wNTAzNTUwMjU3MyAyMjMuMiBMIDQwMS43ODExMjE3NTEwMyAyMjEuOTYgTCA0MDQuODUzMjM0MzE2OTggMjIzLjIgTCA0MDcuMjQyNjU1MjAxNjIgMjIxLjk2IEwgNDA4Ljk0OTM4NDQwNDkyIDIyMy4yIEwgNDExLjMzODgwNTI4OTU2IDIyMy4yIEwgNDEzLjcyODIyNjE3NDE5IDIyMy4yIEwgNDE2LjExNzY0NzA1ODgyIDIyMy4yIEwgNDE4LjUwNzA2Nzk0MzQ2IDIyMS45NiBMIDQyMC44OTY0ODg4MjgwOSAyMjYuOTIwMDAwMDAwMDAwMDIgTCA0MjMuMjg1OTA5NzEyNzIgMjIxLjk2IEwgNDI1LjY3NTMzMDU5NzM2IDIyMS45NiBMIDQyOC4wNjQ3NTE0ODE5OSAyMjEuOTYgTCA0MzIuODQzNTkzMjUxMjUgMjIxLjk2IEwgNDM1LjIzMzAxNDEzNTg5IDIyMy4yIEwgNDM3LjYyMjQzNTAyMDUyIDIyMS45NiBMIDQ0MC4wMTE4NTU5…0ZSgwLDApIiB5PSIzMjAiIG9wYWNpdHk9IjEiPjx0c3Bhbj4xIDQ1MEc8L3RzcGFuPjwvdGV4dD48dGV4dCB4PSI1OTcuNTU5NDExMDE2Nzc1NCIgc3R5bGU9ImNvbG9yOiM2MDYwNjA7Y3Vyc29yOmRlZmF1bHQ7Zm9udC1zaXplOjExcHg7ZmlsbDojNjA2MDYwO3dpZHRoOjk1cHg7dGV4dC1vdmVyZmxvdzpjbGlwOyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwwKSIgeT0iMzIwIiBvcGFjaXR5PSIxIj48dHNwYW4+MSA0NzVHPC90c3Bhbj48L3RleHQ+PC9nPjxnIGNsYXNzPSJoaWdoY2hhcnRzLWF4aXMtbGFiZWxzIGhpZ2hjaGFydHMteWF4aXMtbGFiZWxzIj48dGV4dCB4PSI1OSIgc3R5bGU9ImNvbG9yOiM0MzQzNDg7Y3Vyc29yOmRlZmF1bHQ7Zm9udC1zaXplOjExcHg7ZmlsbDojNDM0MzQ4O3dpZHRoOjIwOXB4O3RleHQtb3ZlcmZsb3c6Y2xpcDsiIHRleHQtYW5jaG9yPSJlbmQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsMCkiIHk9IjMwNCIgb3BhY2l0eT0iMSI+MDwvdGV4dD48dGV4dCB4PSI1OSIgc3R5bGU9ImNvbG9yOiM0MzQzNDg7Y3Vyc29yOmRlZmF1bHQ7Zm9udC1zaXplOjExcHg7ZmlsbDojNDM0MzQ4O3dpZHRoOjIwOXB4O3RleHQtb3ZlcmZsb3c6Y2xpcDsiIHRleHQtYW5jaG9yPSJlbmQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsMCkiIHk9IjI0MiIgb3BhY2l0eT0iMSI+NTA8L3RleHQ+PHRleHQgeD0iNTkiIHN0eWxlPSJjb2xvcjojNDM0MzQ4O2N1cnNvcjpkZWZhdWx0O2ZvbnQtc2l6ZToxMXB4O2ZpbGw6IzQzNDM0ODt3aWR0aDoyMDlweDt0ZXh0LW92ZXJmbG93OmNsaXA7IiB0ZXh0LWFuY2hvcj0iZW5kIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLDApIiB5PSIxODAiIG9wYWNpdHk9IjEiPjEwMDwvdGV4dD48dGV4dCB4PSI1OSIgc3R5bGU9ImNvbG9yOiM0MzQzNDg7Y3Vyc29yOmRlZmF1bHQ7Zm9udC1zaXplOjExcHg7ZmlsbDojNDM0MzQ4O3dpZHRoOjIwOXB4O3RleHQtb3ZlcmZsb3c6Y2xpcDsiIHRleHQtYW5jaG9yPSJlbmQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsMCkiIHk9IjExOCIgb3BhY2l0eT0iMSI+MTUwPC90ZXh0Pjx0ZXh0IHg9IjU5IiBzdHlsZT0iY29sb3I6IzQzNDM0ODtjdXJzb3I6ZGVmYXVsdDtmb250LXNpemU6MTFweDtmaWxsOiM0MzQzNDg7d2lkdGg6MjA5cHg7dGV4dC1vdmVyZmxvdzpjbGlwOyIgdGV4dC1hbmNob3I9ImVuZCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwwKSIgeT0iNTYiIG9wYWNpdHk9IjEiPjIwMDwvdGV4dD48L2c+PGcgY2xhc3M9ImhpZ2hjaGFydHMtYXhpcy1sYWJlbHMgaGlnaGNoYXJ0cy15YXhpcy1sYWJlbHMiPjx0ZXh0IHg9IjYxMyIgc3R5bGU9ImNvbG9yOiM3Y2I1ZWM7Y3Vyc29yOmRlZmF1bHQ7Zm9udC1zaXplOjExcHg7ZmlsbDojN2NiNWVjO3dpZHRoOjIwOXB4O3RleHQtb3ZlcmZsb3c6Y2xpcDsiIHRleHQtYW5jaG9yPSJzdGFydCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwwKSIgeT0iMzA0IiBvcGFjaXR5PSIxIj4wPC90ZXh0Pjx0ZXh0IHg9IjYxMyIgc3R5bGU9ImNvbG9yOiM3Y2I1ZWM7Y3Vyc29yOmRlZmF1bHQ7Zm9udC1zaXplOjExcHg7ZmlsbDojN2NiNWVjO3dpZHRoOjIwOXB4O3RleHQtb3ZlcmZsb3c6Y2xpcDsiIHRleHQtYW5jaG9yPSJzdGFydCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwwKSIgeT0iMjQyIiBvcGFjaXR5PSIxIj41PC90ZXh0Pjx0ZXh0IHg9IjYxMyIgc3R5bGU9ImNvbG9yOiM3Y2I1ZWM7Y3Vyc29yOmRlZmF1bHQ7Zm9udC1zaXplOjExcHg7ZmlsbDojN2NiNWVjO3dpZHRoOjIwOXB4O3RleHQtb3ZlcmZsb3c6Y2xpcDsiIHRleHQtYW5jaG9yPSJzdGFydCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwwKSIgeT0iMTgwIiBvcGFjaXR5PSIxIj4xMDwvdGV4dD48dGV4dCB4PSI2MTMiIHN0eWxlPSJjb2xvcjojN2NiNWVjO2N1cnNvcjpkZWZhdWx0O2ZvbnQtc2l6ZToxMXB4O2ZpbGw6IzdjYjVlYzt3aWR0aDoyMDlweDt0ZXh0LW92ZXJmbG93OmNsaXA7IiB0ZXh0LWFuY2hvcj0ic3RhcnQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsMCkiIHk9IjExOCIgb3BhY2l0eT0iMSI+MTU8L3RleHQ+PHRleHQgeD0iNjEzIiBzdHlsZT0iY29sb3I6IzdjYjVlYztjdXJzb3I6ZGVmYXVsdDtmb250LXNpemU6MTFweDtmaWxsOiM3Y2I1ZWM7d2lkdGg6MjA5cHg7dGV4dC1vdmVyZmxvdzpjbGlwOyIgdGV4dC1hbmNob3I9InN0YXJ0IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLDApIiB5PSI1NiIgb3BhY2l0eT0iMSI+MjA8L3RleHQ+PC9nPjxnIGNsYXNzPSJoaWdoY2hhcnRzLXRvb2x0aXAiIHN0eWxlPSJjdXJzb3I6ZGVmYXVsdDtwYWRkaW5nOjA7cG9pbnRlci1ldmVudHM6bm9uZTt3aGl0ZS1zcGFjZTpub3dyYXA7IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLC05OTk5KSI+PHBhdGggZmlsbD0ibm9uZSIgZD0iTSAzLjUgMC41IEwgMTMuNSAwLjUgQyAxNi41IDAuNSAxNi41IDAuNSAxNi41IDMuNSBMIDE2LjUgMTMuNSBDIDE2LjUgMTYuNSAxNi41IDE2LjUgMTMuNSAxNi41IEwgMy41IDE2LjUgQyAwLjUgMTYuNSAwLjUgMTYuNSAwLjUgMTMuNSBMIDAuNSAzLjUgQyAwLjUgMC41IDAuNSAwLjUgMy41IDAuNSIgaXNTaGFkb3c9InRydWUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS1vcGFjaXR5PSIwLjA0OTk5OTk5OTk5OTk5OTk5NiIgc3Ryb2tlLXdpZHRoPSI1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxLCAxKSI+PC9wYXRoPjxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0gMy41IDAuNSBMIDEzLjUgMC41IEMgMTYuNSAwLjUgMTYuNSAwLjUgMTYuNSAzLjUgTCAxNi41IDEzLjUgQyAxNi41IDE2LjUgMTYuNSAxNi41IDEzLjUgMTYuNSBMIDMuNSAxNi41IEMgMC41IDE2LjUgMC41IDE2LjUgMC41IDEzLjUgTCAwLjUgMy41IEMgMC41IDAuNSAwLjUgMC41IDMuNSAwLjUiIGlzU2hhZG93PSJ0cnVlIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utb3BhY2l0eT0iMC4wOTk5OTk5OTk5OTk5OTk5OSIgc3Ryb2tlLXdpZHRoPSIzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxLCAxKSI+PC9wYXRoPjxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0gMy41IDAuNSBMIDEzLjUgMC41IEMgMTYuNSAwLjUgMTYuNSAwLjUgMTYuNSAzLjUgTCAxNi41IDEzLjUgQyAxNi41IDE2LjUgMTYuNSAxNi41IDEzLjUgMTYuNSBMIDMuNSAxNi41IEMgMC41IDE2LjUgMC41IDE2LjUgMC41IDEzLjUgTCAwLjUgMy41IEMgMC41IDAuNSAwLjUgMC41IDMuNSAwLjUiIGlzU2hhZG93PSJ0cnVlIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utb3BhY2l0eT0iMC4xNSIgc3Ryb2tlLXdpZHRoPSIxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxLCAxKSI+PC9wYXRoPjxwYXRoIGZpbGw9InJnYmEoMjQ5LCAyNDksIDI0OSwgLjg1KSIgZD0iTSAzLjUgMC41IEwgMTMuNSAwLjUgQyAxNi41IDAuNSAxNi41IDAuNSAxNi41IDMuNSBMIDE2LjUgMTMuNSBDIDE2LjUgMTYuNSAxNi41IDE2LjUgMTMuNSAxNi41IEwgMy41IDE2LjUgQyAwLjUgMTYuNSAwLjUgMTYuNSAwLjUgMTMuNSBMIDAuNSAzLjUgQyAwLjUgMC41IDAuNSAwLjUgMy41IDAuNSI+PC9wYXRoPjx0ZXh0IHg9IjgiIHN0eWxlPSJmb250LXNpemU6MTJweDtjb2xvcjojMzMzMzMzO2ZpbGw6IzMzMzMzMzsiIHk9IjIwIj48L3RleHQ+PC9nPjx0ZXh0IHg9IjY1NSIgdGV4dC1hbmNob3I9ImVuZCIgc3R5bGU9ImN1cnNvcjpwb2ludGVyO2NvbG9yOiM5MDkwOTA7Zm9udC1zaXplOjlweDtmaWxsOiM5MDkwOTA7IiB5PSIzOTUiPkhpZ2hjaGFydHMuY29tPC90ZXh0Pjwvc3ZnPg==">"

        public static Image RotateImage(Image img, float rotationAngle)
        {
            Bitmap bmp = new Bitmap(img.Height, img.Width);
            bmp.SetResolution(img.HorizontalResolution, img.VerticalResolution);
            Graphics gfx = Graphics.FromImage(bmp);
            gfx.TranslateTransform((float)bmp.Width / 2, (float)img.Height / 2);
            gfx.RotateTransform(rotationAngle);
            gfx.TranslateTransform(-(float)bmp.Width / 2, -(float)img.Height / 2);
            gfx.InterpolationMode = InterpolationMode.HighQualityBicubic;
            gfx.DrawImage(img, new Point(0, 0));
            gfx.Dispose();
            return bmp;
        }


    }
}
