import { assert, expect } from 'chai'
import { spy } from 'sinon'
import JsxLexer from '../../src/lexers/jsx-lexer'

describe('JsxLexer', () => {
  describe('<Interpolate>', () => {
    it('extracts keys from i18nKey attributes', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Interpolate i18nKey="first" />'
      assert.deepEqual(Lexer.extract(content), [{ key: 'first' }])
      done()
    })
  })

  describe('<Trans>', () => {
    it('extracts keys from i18nKey attributes from closing tags', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans i18nKey="first" count={count}>Yo</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'first', defaultValue: 'Yo', count: '{count}' },
      ])
      done()
    })

    it('extracts keys from user-defined key attributes from closing tags', (done) => {
      const Lexer = new JsxLexer({ attr: 'myIntlKey' })
      const content = '<Trans myIntlKey="first" count={count}>Yo</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'first', defaultValue: 'Yo', count: '{count}' },
      ])
      done()
    })

    it('extracts keys from i18nKey attributes from self-closing tags', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans i18nKey="first" count={count} />'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'first', count: '{count}' },
      ])
      done()
    })

    it('extracts keys from user-defined key attributes from self-closing tags', (done) => {
      const Lexer = new JsxLexer({ attr: 'myIntlKey' })
      const content = '<Trans myIntlKey="first" count={count} />'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'first', count: '{count}' },
      ])
      done()
    })

    it('extracts custom attributes', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans customAttribute="Youpi">Yo</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'Yo', customAttribute: 'Youpi' },
      ])
      done()
    })

    it('extracts keys from Trans elements without an i18nKey', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans count={count}>Yo</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'Yo', count: '{count}' },
      ])
      done()
    })

    it('extracts keys from Trans elements and ignores values of expressions and spaces', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans count={count}>{{ key: property }}</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: '{{key}}', count: '{count}' },
      ])
      done()
    })

    it('invalid interpolation gets stripped', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans count={count}>before{{ key1, key2 }}after</Trans>'
      assert.deepEqual(Lexer.extract(content), [
        { key: 'beforeafter', count: '{count}' },
      ])
      done()
    })

    it("doesn't add a blank key for self-closing or empty tags", (done) => {
      const Lexer = new JsxLexer()

      const emptyTag = '<Trans count={count}></Trans>'
      assert.deepEqual(Lexer.extract(emptyTag), [])

      const selfClosing = '<Trans count={count}/>'
      assert.deepEqual(Lexer.extract(selfClosing), [])

      done()
    })

    it('erases tags from content', (done) => {
      const Lexer = new JsxLexer()
      const content =
        '<Trans>a<b test={"</b>"}>c<c>z</c></b>{d}<br stuff={y}/></Trans>'
      assert.equal(Lexer.extract(content)[0].key, 'a<1>c<1>z</1></1>{d}<3></3>')
      done()
    })

    it('erases comment expressions', (done) => {
      const Lexer = new JsxLexer()
      const content = '<Trans>{/* some comment */}Some Content</Trans>'
      assert.equal(Lexer.extract(content)[0].key, 'Some Content')
      done()
    })

    it('handles jsx fragments', (done) => {
      const Lexer = new JsxLexer()
      const content = '<><Trans i18nKey="first" /></>'
      assert.deepEqual(Lexer.extract(content), [{ key: 'first' }])
      done()
    })

    it('interpolates literal string values', (done) => {
      const Lexer = new JsxLexer()
      const content = `<Trans>Some{' '}Interpolated {'Content'}</Trans>`
      assert.equal(Lexer.extract(content)[0].key, 'Some Interpolated Content')
      done()
    })

    it('uses the ns (namespace) prop', (done) => {
      const Lexer = new JsxLexer()
      const content = `<Trans ns="foo">bar</Trans>`
      assert.deepEqual(Lexer.extract(content), [
        { key: 'bar', namespace: 'foo' },
      ])
      done()
    })
  })

  describe('supports TypeScript', () => {
    it('supports basic tsx syntax', () => {
      const Lexer = new JsxLexer()
      const content = '<Interpolate i18nKey="first" someVar={foo() as bar} />'
      assert.deepEqual(Lexer.extract(content), [{ key: 'first' }])
    })

    describe('<Interpolate>', () => {
      it('extracts keys from i18nKey attributes', (done) => {
        const Lexer = new JsxLexer()
        const content = '<Interpolate i18nKey="first" />'
        assert.deepEqual(Lexer.extract(content), [{ key: 'first' }])
        done()
      })
    })

    describe('<Trans>', () => {
      it('extracts keys from i18nKey attributes from closing tags', (done) => {
        const Lexer = new JsxLexer()
        const content = '<Trans i18nKey="first" count={count}>Yo</Trans>'
        assert.deepEqual(Lexer.extract(content), [
          { key: 'first', defaultValue: 'Yo', count: '{count}' },
        ])
        done()
      })

      it('extracts keys from user-defined key attributes from closing tags', (done) => {
        const Lexer = new JsxLexer({ attr: 'myIntlKey' })
        const content = '<Trans myIntlKey="first" count={count}>Yo</Trans>'
        assert.deepEqual(Lexer.extract(content), [
          { key: 'first', defaultValue: 'Yo', count: '{count}' },
        ])
        done()
      })

      it('extracts keys from i18nKey attributes from self-closing tags', (done) => {
        const Lexer = new JsxLexer()
        const content = '<Trans i18nKey="first" count={count} />'
        assert.deepEqual(Lexer.extract(content), [
          { key: 'first', count: '{count}' },
        ])
        done()
      })

      it('extracts keys from user-defined key attributes from self-closing tags', (done) => {
        const Lexer = new JsxLexer({ attr: 'myIntlKey' })
        const content = '<Trans myIntlKey="first" count={count} />'
        assert.deepEqual(Lexer.extract(content), [
          { key: 'first', count: '{count}' },
        ])
        done()
      })

      it('extracts keys from Trans elements without an i18nKey', (done) => {
        const Lexer = new JsxLexer()
        const content = '<Trans count={count}>Yo</Trans>'
        assert.deepEqual(Lexer.extract(content), [
          { key: 'Yo', count: '{count}' },
        ])
        done()
      })

      it('extracts keys from Trans elements and ignores values of expressions and spaces', (done) => {
        const Lexer = new JsxLexer()
        const content = '<Trans count={count}>{{ key: property }}</Trans>'
        assert.deepEqual(Lexer.extract(content), [
          { key: '{{key}}', count: '{count}' },
        ])
        done()
      })

      it('invalid interpolation gets stripped', (done) => {
        const Lexer = new JsxLexer()
        const content =
          '<Trans count={count}>before{{ key1, key2 }}after</Trans>'
        assert.deepEqual(Lexer.extract(content), [
          { key: 'beforeafter', count: '{count}' },
        ])
        done()
      })

      it("doesn't add a blank key for self-closing or empty tags", (done) => {
        const Lexer = new JsxLexer()

        const emptyTag = '<Trans count={count}></Trans>'
        assert.deepEqual(Lexer.extract(emptyTag), [])

        const selfClosing = '<Trans count={count}/>'
        assert.deepEqual(Lexer.extract(selfClosing), [])

        done()
      })

      it('erases tags from content', (done) => {
        const Lexer = new JsxLexer()
        const content =
          '<Trans>a<b test={"</b>"}>c<c>z</c></b>{d}<br stuff={y}/></Trans>'
        assert.equal(
          Lexer.extract(content)[0].key,
          'a<1>c<1>z</1></1>{d}<3></3>'
        )
        done()
      })

      it('erases comment expressions', (done) => {
        const Lexer = new JsxLexer()
        const content = '<Trans>{/* some comment */}Some Content</Trans>'
        assert.equal(Lexer.extract(content)[0].key, 'Some Content')
        done()
      })
    })
  })
})
