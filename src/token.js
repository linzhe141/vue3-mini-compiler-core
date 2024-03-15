function isTagStartChar(c) {
  const code = c.charCodeAt(0)
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122)
}
export function isWhitespace(c) {
  return c === ' ' || c === '\n' || c === '\t' || c === '\f' || c === '\r'
}
function isEndOfTagSection(c) {
  return c === '/' || c === '>' || isWhitespace(c)
}
export class Tokenizer {
  state = 'Text'
  stack = []
  index = 0
  sectionStart = 0
  buffer = ''
  cbs = null
  delimiterIndex = -1
  constructor(stack, cbs) {
    this.stack = stack
    this.cbs = cbs
  }
  stateText(c) {
    if (c === '<') {
      if (this.index > this.sectionStart) {
        this.cbs.ontext(this.sectionStart, this.index)
      }
      this.state = 'BeforeTagName'
      this.sectionStart = this.index
    } else if (c === '{') {
      this.state = 'InterpolationOpen'
      this.delimiterIndex = 0
      this.stateInterpolationOpen(c)
    }
  }
  stateInterpolationOpen(c) {
    if (c === '{') {
      if (this.delimiterIndex === '{{'.length - 1) {
        const start = this.index + 1 - '{{'.length
        // start 的后面的第一个字符
        if (start > this.sectionStart) {
          this.cbs.ontext(this.sectionStart, start)
        }
        this.state = 'Interpolation'
        this.sectionStart = start
      } else {
        this.delimiterIndex++
      }
    } else {
      this.state = 'Text'
      this.stateText(c)
    }
  }
  stateInterpolation(c) {
    if (c === '}') {
      this.state = 'InterpolationClose'
      this.delimiterIndex = 0
      this.stateInterpolationClose(c)
    }
  }

  stateInterpolationClose(c) {
    if (c === '}') {
      if (this.delimiterIndex === '}}'.length - 1) {
        this.cbs.oninterpolation(this.sectionStart, this.index + 1)
        this.state = 'Text'
        this.sectionStart = this.index + 1
      } else {
        this.delimiterIndex++
      }
    } else {
      this.state = 'Interpolation'
      this.stateInterpolation(c)
    }
  }
  stateBeforeTagName(c) {
    if (isTagStartChar(c)) {
      this.sectionStart = this.index
      this.state = 'InTagName'
    } else if (c === '/') {
      this.state = 'BeforeClosingTagName'
    } else {
      this.state = 'Text'
      this.stateText(c)
    }
  }
  stateInTagName(c) {
    if (isEndOfTagSection(c)) {
      this.handleTagName(c)
    }
  }
  stateBeforeAttrName(c) {
    if (c === '>') {
      this.cbs.onopentagend(this.index)
      this.state = 'Text'
      this.sectionStart = this.index + 1
    } else if (c === '/') {
      this.state = 'InSelfClosingTag'
    } else if (!isWhitespace(c)) {
      // 属性属性名开始
      // 比如 <div x="x" @y="y" />中的x=前面的x和@y=的@
      this.handleAttrStart(c)
    }
  }
  stateInSelfClosingTag(c) {
    if (c === '>') {
      this.cbs.onselfclosingtag(this.index)
      this.state = 'Text'
      this.sectionStart = this.index + 1
    }
    // <div a/b>处理错误模板
    else if (!isWhitespace(c)) {
      this.state = State.BeforeAttrName
      this.stateBeforeAttrName(c)
    }
  }
  stateInAttrName(c) {
    if (c === '=' || isEndOfTagSection(c)) {
      this.cbs.onattribname(this.sectionStart, this.index)
      this.handleAttrNameEnd(c)
    }
  }
  stateAfterAttrName(c) {
    if (c === '=') {
      this.state = 'BeforeAttrValue'
    } else if (c === '/' || c === '>') {
      this.cbs.onattribend('QuoteType.NoValue', this.sectionStart)
      this.sectionStart = -1
      this.state = 'BeforeAttrName'
      this.stateBeforeAttrName(c)
    } else if (!isWhitespace(c)) {
      this.cbs.onattribend('QuoteType.NoValue', this.sectionStart)
      this.handleAttrStart(c)
    }
  }

  stateBeforeAttrValue(c) {
    if (c === '"') {
      this.state = 'InAttrValueDq'
      this.sectionStart = this.index + 1
    }
  }

  stateBeforeClosingTagName(c) {
    if (isWhitespace(c)) {
      // Ignore
    } else if (c === '>') {
      this.state = 'Text'
      // Ignore
      this.sectionStart = this.index + 1
    } else {
      // this.state = isTagStartChar(c)
      //   ? State.InClosingTagName
      //   : State.InSpecialComment
      this.state = 'InClosingTagName'
      this.sectionStart = this.index
    }
  }
  stateInDirArg(c) {
    if (c === '=' || isEndOfTagSection(c)) {
      this.cbs.ondirarg(this.sectionStart, this.index)
      this.handleAttrNameEnd(c)
    }
  }
  stateInClosingTagName(c) {
    if (c === '>' || isWhitespace(c)) {
      this.cbs.onclosetag(this.sectionStart, this.index)
      this.sectionStart = -1
      this.state = 'AfterClosingTagName'
      this.stateAfterClosingTagName(c)
    }
  }
  stateAfterClosingTagName(c) {
    // Skip everything until ">"
    if (c === '>') {
      this.state = 'Text'
      this.sectionStart = this.index + 1
    }
  }
  handleInAttrValue(c, quote) {
    if (c === quote) {
      this.cbs.onattribdata(this.sectionStart, this.index)
      this.sectionStart = -1
      this.cbs.onattribend(quote === '"' ? '"' : "'", this.index + 1)
      this.state = 'BeforeAttrName'
    }
  }
  stateInAttrValueDoubleQuotes(c) {
    this.handleInAttrValue(c, '"')
  }
  handleTagName(c) {
    this.cbs.onopentagname(this.sectionStart, this.index)
    this.sectionStart = -1
    this.state = 'BeforeAttrName'
    this.stateBeforeAttrName(c)
  }
  handleAttrStart(c) {
    if (c === '@') {
      //
      this.cbs.ondirname(this.index, this.index + 1)
      this.state = 'InDirArg'
      this.sectionStart = this.index + 1
    } else {
      this.state = 'InAttrName'
      this.sectionStart = this.index
    }
  }
  handleAttrNameEnd(c) {
    this.sectionStart = this.index
    this.state = 'AfterAttrName'
    this.cbs.onattribnameend(this.index)
    this.stateAfterAttrName(c)
  }
  parse(input) {
    this.buffer = input
    while (this.index < this.buffer.length) {
      const c = this.buffer[this.index]
      switch (this.state) {
        case 'Text': {
          this.stateText(c)
          break
        }
        case 'InterpolationOpen': {
          this.stateInterpolationOpen(c)
          break
        }
        case 'Interpolation': {
          this.stateInterpolation(c)
          break
        }
        case 'InterpolationClose': {
          this.stateInterpolationClose(c)
          break
        }
        case 'BeforeTagName': {
          this.stateBeforeTagName(c)
          break
        }
        case 'InTagName': {
          this.stateInTagName(c)
          break
        }
        case 'BeforeAttrName': {
          this.stateBeforeAttrName(c)
          break
        }
        case 'InAttrName': {
          this.stateInAttrName(c)
          break
        }
        case 'BeforeAttrValue': {
          this.stateBeforeAttrValue(c)
          break
        }
        case 'InAttrValueDq': {
          this.stateInAttrValueDoubleQuotes(c)
          break
        }
        case 'BeforeClosingTagName': {
          this.stateBeforeClosingTagName(c)
          break
        }
        case 'InClosingTagName': {
          this.stateInClosingTagName(c)
          break
        }
        case 'AfterClosingTagName': {
          this.stateAfterClosingTagName(c)
          break
        }
        case 'AfterAttrName': {
          this.stateAfterAttrName(c)
          break
        }
        case 'InSelfClosingTag': {
          this.stateInSelfClosingTag(c)
          break
        }
        case 'InDirArg': {
          this.stateInDirArg(c)
          break
        }
      }
      this.index++
    }
    this.cleanup()
  }
  cleanup() {
    // If we are inside of text or attributes, emit what we already have.
    if (this.sectionStart !== this.index) {
      if (this.state === 'Text') {
        this.cbs.ontext(this.sectionStart, this.index)
        this.sectionStart = this.index
      }
      // else if (
      //   this.state === State.InAttrValueDq ||
      //   this.state === State.InAttrValueSq ||
      //   this.state === State.InAttrValueNq
      // ) {
      //   this.cbs.onattribdata(this.sectionStart, this.index)
      //   this.sectionStart = this.index
      // }
    }
  }
}
