
#
# For diagrams needs plantuml + https://github.com/timofurrer/pandoc-plantuml-filter
#

all: DPIA.pdf

DPIA.pdf: DPIA.md template.tex Makefile
	pandoc \
		-N \
		--template=template.tex \
		--variable mainfont="Times New Roman" \
		--variable sansfont="Helvetica" \
		--variable monofont="Menlo" \
		--variable fontsize=12pt \
		--variable version=2.0 \
		$< \
		--pdf-engine=xelatex \
		--toc \
		--filter pandoc-plantuml \
		-o $@