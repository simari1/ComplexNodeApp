import Search from "./modules/search";
import Chat from "./modules/chat";
import RegistrationForm from "./modules/registrationForm";

if ($(".header-search-icon")) {
  new Search();
}
if ($("#chat-wrapper")) {
  new Chat();
}
if ($("#registration-form")) {
  new RegistrationForm();
}
