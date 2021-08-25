import Search from "./modules/search";
import Chat from "./modules/chat";

if ($(".header-search-icon")) {
  new Search();
}
if ($("#chat-wrapper")) {
  new Chat();
}
