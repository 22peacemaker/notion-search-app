import { mount } from '@vue/test-utils'
import NavBar from '../src/components/NavBar.vue'

describe('NavBar', () => {
  it('renders user email and buttons', () => {
    const wrapper = mount(NavBar, { props: { user: { email: 'a@b.com' } } })
    expect(wrapper.text()).toContain('Hello, a@b.com')
    expect(wrapper.find('button').text()).toBe('🌓')
  })
})
